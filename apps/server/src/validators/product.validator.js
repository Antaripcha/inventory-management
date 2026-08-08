import { body, param, query } from "express-validator";

export const productValidator = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Product name must be 2-120 characters"),
  body("sku")
    .trim()
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage("SKU may only contain letters, numbers, - and _")
    .isLength({ min: 2, max: 40 }),
  body("category").isMongoId().withMessage("Category is required and must be valid"),
  body("description").optional({ checkFalsy: true }).isLength({ max: 1000 }),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("supplier").optional({ checkFalsy: true }).isLength({ max: 120 }),
  body("barcode").optional({ checkFalsy: true }).isLength({ max: 60 }),
  body("lowStockThreshold").optional({ checkFalsy: true }).isInt({ min: 0 }),
];

export const productIdValidator = [param("id").isMongoId().withMessage("Invalid product id")];

export const productQueryValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("sortBy").optional().isIn(["name", "quantity", "price", "createdAt", "updatedAt"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
  query("status").optional().isIn(["In Stock", "Low Stock", "Out of Stock"]),
];
