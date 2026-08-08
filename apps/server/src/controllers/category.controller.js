import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { Category, Product } from "../models/index.js";
import { recordAudit } from "../services/audit.service.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ user: req.user.id }).sort({ name: 1 }).lean();

  const counts = await Product.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  const data = categories.map((c) => ({
    ...c,
    productCount: countMap.get(c._id.toString()) || 0,
  }));

  sendSuccess(res, { data });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
  if (!category) throw ApiError.notFound("Category not found");
  sendSuccess(res, { data: category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Category.findOne({ user: req.user.id, name: new RegExp(`^${name}$`, "i") });
  if (existing) throw ApiError.conflict("A category with this name already exists");

  const category = await Category.create({ user: req.user.id, name, description, createdBy: req.user.id });

  await recordAudit({
    user: req.user.id,
    action: "CREATE",
    entity: "Category",
    entityId: category._id,
    description: `Created category "${category.name}"`,
    ip: req.ip,
  });

  sendSuccess(res, { statusCode: 201, message: "Category created", data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
  if (!category) throw ApiError.notFound("Category not found");

  if (name && name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({ user: req.user.id, name: new RegExp(`^${name}$`, "i") });
    if (existing) throw ApiError.conflict("A category with this name already exists");
    category.name = name;
  }
  if (description !== undefined) category.description = description;

  await category.save();

  await recordAudit({
    user: req.user.id,
    action: "UPDATE",
    entity: "Category",
    entityId: category._id,
    description: `Updated category "${category.name}"`,
    ip: req.ip,
  });

  sendSuccess(res, { message: "Category updated", data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
  if (!category) throw ApiError.notFound("Category not found");

  const inUse = await Product.countDocuments({ user: req.user.id, category: category._id });
  if (inUse > 0) {
    throw ApiError.badRequest(
      `Cannot delete category: ${inUse} product(s) still reference it`
    );
  }

  await category.deleteOne();

  await recordAudit({
    user: req.user.id,
    action: "DELETE",
    entity: "Category",
    entityId: category._id,
    description: `Deleted category "${category.name}"`,
    ip: req.ip,
  });

  sendSuccess(res, { message: "Category deleted" });
});
