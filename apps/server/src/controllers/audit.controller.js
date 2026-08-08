import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { AuditLog } from "../models/index.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, entity, action } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 25, 100);

  const filter = { user: req.user.id };
  if (entity) filter.entity = entity;
  if (action) filter.action = action;

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("user", "name email role"),
    AuditLog.countDocuments(filter),
  ]);

  sendSuccess(res, {
    data: items,
    meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});
