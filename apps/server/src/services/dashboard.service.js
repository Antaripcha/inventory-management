import mongoose from "mongoose";
import { Product, Category, InventoryTransaction } from "../models/index.js";

export async function getSummary(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const [totals] = await Product.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: "$quantity" },
        inventoryValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        lowStock: {
          $sum: { $cond: [{ $eq: ["$status", "Low Stock"] }, 1, 0] },
        },
        outOfStock: {
          $sum: { $cond: [{ $eq: ["$status", "Out of Stock"] }, 1, 0] },
        },
      },
    },
  ]);

  const totalCategories = await Category.countDocuments({ user: userId });

  return {
    totalProducts: totals?.totalProducts || 0,
    totalCategories,
    totalStock: totals?.totalStock || 0,
    inventoryValue: Number((totals?.inventoryValue || 0).toFixed(2)),
    lowStock: totals?.lowStock || 0,
    outOfStock: totals?.outOfStock || 0,
  };
}

export async function getCategoryDistribution(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return Product.aggregate([
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        stock: { $sum: "$quantity" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        category: { $ifNull: ["$category.name", "Uncategorized"] },
        count: 1,
        stock: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
}

export async function getStockStatusBreakdown(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const rows = await Product.aggregate([
    { $match: { user: userObjectId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const map = { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 };
  rows.forEach((r) => {
    map[r._id] = r.count;
  });
  return Object.entries(map).map(([status, count]) => ({ status, count }));
}

export async function getInventoryValueTrend(userId, days = 14) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const since = new Date();
  since.setDate(since.getDate() - days);

  return InventoryTransaction.aggregate([
    { $match: { user: userObjectId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        stockIn: {
          $sum: { $cond: [{ $eq: ["$type", "STOCK_IN"] }, "$quantity", 0] },
        },
        stockOut: {
          $sum: { $cond: [{ $eq: ["$type", "STOCK_OUT"] }, "$quantity", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", stockIn: 1, stockOut: 1 } },
  ]);
}

export async function getRecentActivity(userId, limit = 10) {
  return InventoryTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("product", "name sku")
    .populate("performedBy", "name email");
}
