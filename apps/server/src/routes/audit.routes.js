import { Router } from "express";
import * as auditController from "../controllers/audit.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate, authorize("admin", "user"));

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit]
 *     summary: List audit logs (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated audit log list }
 */
router.get("/", auditController.listAuditLogs);

export default router;
