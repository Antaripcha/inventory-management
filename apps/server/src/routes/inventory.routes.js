import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import { inventoryAdjustValidator } from "../validators/inventory.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /inventory/transactions:
 *   get:
 *     tags: [Inventory]
 *     summary: List all inventory transactions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated transaction list }
 */
router.get("/transactions", inventoryController.listAllTransactions);

/**
 * @openapi
 * /inventory/{id}/adjust:
 *   post:
 *     tags: [Inventory]
 *     summary: Increase, reduce, or set a product's stock quantity
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, quantity]
 *             properties:
 *               type: { type: string, enum: [STOCK_IN, STOCK_OUT, ADJUSTMENT] }
 *               quantity: { type: integer }
 *               reason: { type: string }
 *     responses:
 *       200: { description: Stock updated }
 */
router.post(
  "/:id/adjust",
  authorize("admin", "user"),
  inventoryAdjustValidator,
  validate,
  inventoryController.adjustStock
);

/**
 * @openapi
 * /inventory/{id}/history:
 *   get:
 *     tags: [Inventory]
 *     summary: Get transaction history for a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Transaction history }
 */
router.get("/:id/history", inventoryController.getProductHistory);

export default router;
