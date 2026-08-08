import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { InventoryTransaction } from "../models/index.js";
import { applyStockChange } from "../services/inventory.service.js";
import { recordAudit } from "../services/audit.service.js";

export const adjustStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, quantity, reason } = req.body;

  const { product, transaction } = await applyStockChange({
    productId: id,
    type,
    quantity,
    reason,
    userId: req.user.id,
  });

  await recordAudit({
    user: req.user.id,
    action: "STOCK_CHANGE",
    entity: "Product",
    entityId: product._id,
    description: `${type} of ${quantity} on "${product.name}" (${product.sku})`,
    metadata: { previousQuantity: transaction.previousQuantity, newQuantity: transaction.newQuantity },
    ip: req.ip,
  });

  sendSuccess(res, {
    message: "Stock updated",
    data: { product, transaction },
  });
});

export const getProductHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, total] = await Promise.all([
    InventoryTransaction.find({ product: id, user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("performedBy", "name email"),
    InventoryTransaction.countDocuments({ product: id, user: req.user.id }),
  ]);

  sendSuccess(res, {
    data: items,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

export const listAllTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, total] = await Promise.all([
    InventoryTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("product", "name sku")
      .populate("performedBy", "name email"),
    InventoryTransaction.countDocuments({ user: req.user.id }),
  ]);

  sendSuccess(res, {
    data: items,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});
