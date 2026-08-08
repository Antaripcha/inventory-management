import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard summary, charts data & recent activity
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard payload }
 */
router.get("/", dashboardController.getDashboard);

export default router;
