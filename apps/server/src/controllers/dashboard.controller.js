import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import {
  getSummary,
  getCategoryDistribution,
  getStockStatusBreakdown,
  getInventoryValueTrend,
  getRecentActivity,
} from "../services/dashboard.service.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const [summary, categoryDistribution, stockStatus, trend, recentActivity] = await Promise.all([
    getSummary(),
    getCategoryDistribution(),
    getStockStatusBreakdown(),
    getInventoryValueTrend(14),
    getRecentActivity(10),
  ]);

  sendSuccess(res, {
    data: { summary, categoryDistribution, stockStatus, trend, recentActivity },
  });
});
