import path from "node:path";
import fs from "node:fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { Product, Category } from "../models/index.js";
import { recordAudit } from "../services/audit.service.js";
import { exportProductsToCSV, importProductsFromCSV } from "../services/csv.service.js";

export const listProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = { user: req.user.id };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (status) filter.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: items,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user.id }).populate(
    "category",
    "name"
  );
  if (!product) throw ApiError.notFound("Product not found");
  sendSuccess(res, { data: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, description, quantity, price, supplier, barcode, lowStockThreshold } =
    req.body;

  const categoryDoc = await Category.findOne({ _id: category, user: req.user.id });
  if (!categoryDoc) throw ApiError.badRequest("Selected category does not exist");

  const existingSku = await Product.findOne({ user: req.user.id, sku: sku.toUpperCase() });
  if (existingSku) throw ApiError.conflict("A product with this SKU already exists");

  const product = await Product.create({
    user: req.user.id,
    name,
    sku: sku.toUpperCase(),
    category,
    description,
    quantity,
    price,
    supplier,
    barcode,
    lowStockThreshold,
    image: req.file ? `/uploads/products/${req.file.filename}` : null,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  await recordAudit({
    user: req.user.id,
    action: "CREATE",
    entity: "Product",
    entityId: product._id,
    description: `Created product "${product.name}" (${product.sku})`,
    ip: req.ip,
  });

  sendSuccess(res, { statusCode: 201, message: "Product created", data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user.id });
  if (!product) throw ApiError.notFound("Product not found");

  const { name, sku, category, description, quantity, price, supplier, barcode, lowStockThreshold } =
    req.body;

  if (category) {
    const categoryDoc = await Category.findOne({ _id: category, user: req.user.id });
    if (!categoryDoc) throw ApiError.badRequest("Selected category does not exist");
    product.category = category;
  }

  if (sku && sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ user: req.user.id, sku: sku.toUpperCase() });
    if (existingSku) throw ApiError.conflict("A product with this SKU already exists");
    product.sku = sku.toUpperCase();
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (quantity !== undefined) product.quantity = quantity;
  if (price !== undefined) product.price = price;
  if (supplier !== undefined) product.supplier = supplier;
  if (barcode !== undefined) product.barcode = barcode;
  if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;

  if (req.file) {
    if (product.image) {
      const oldPath = path.join(process.cwd(), product.image);
      fs.unlink(oldPath, () => {});
    }
    product.image = `/uploads/products/${req.file.filename}`;
  }

  product.updatedBy = req.user.id;
  await product.save();

  await recordAudit({
    user: req.user.id,
    action: "UPDATE",
    entity: "Product",
    entityId: product._id,
    description: `Updated product "${product.name}" (${product.sku})`,
    ip: req.ip,
  });

  sendSuccess(res, { message: "Product updated", data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, user: req.user.id });
  if (!product) throw ApiError.notFound("Product not found");

  if (product.image) {
    const imagePath = path.join(process.cwd(), product.image);
    fs.unlink(imagePath, () => {});
  }

  await product.deleteOne();

  await recordAudit({
    user: req.user.id,
    action: "DELETE",
    entity: "Product",
    entityId: product._id,
    description: `Deleted product "${product.name}" (${product.sku})`,
    ip: req.ip,
  });

  sendSuccess(res, { message: "Product deleted" });
});

export const exportProducts = asyncHandler(async (req, res) => {
  const csv = await exportProductsToCSV(req.user.id);
  res.header("Content-Type", "text/csv");
  res.attachment(`products-${Date.now()}.csv`);
  res.send(csv);
});

export const importProducts = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("CSV file is required");
  const csvText = fs.readFileSync(req.file.path, "utf-8");
  const result = await importProductsFromCSV(csvText, req.user.id);
  fs.unlink(req.file.path, () => {});

  await recordAudit({
    user: req.user.id,
    action: "CREATE",
    entity: "Product",
    description: `Bulk imported products via CSV (created: ${result.created}, updated: ${result.updated})`,
    ip: req.ip,
  });

  sendSuccess(res, { message: "Import completed", data: result });
});
