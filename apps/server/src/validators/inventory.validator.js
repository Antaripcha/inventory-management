import { body, param } from "express-validator";

export const inventoryAdjustValidator = [
  param("id").isMongoId().withMessage("Invalid product id"),
  body("type").isIn(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]).withMessage("Invalid transaction type"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
  body("reason").optional({ checkFalsy: true }).isLength({ max: 300 }),
];
