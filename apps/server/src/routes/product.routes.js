import { Router } from "express";
import multer from "multer";
import * as productController from "../controllers/product.controller.js";
import {
  productValidator,
  productIdValidator,
  productQueryValidator,
} from "../validators/product.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadProductImage } from "../middleware/upload.middleware.js";

const router = Router();
const csvUpload = multer({ dest: "uploads/tmp" });

router.use(authenticate);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with search, filter, sort & pagination
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [In Stock, Low Stock, Out of Stock] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated product list }
 *   post:
 *     tags: [Products]
 *     summary: Create a product (multipart/form-data, supports image upload)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Product created }
 */
router.get("/", productQueryValidator, validate, productController.listProducts);
router.post(
  "/",
  authorize("admin", "user"),
  uploadProductImage,
  productValidator,
  validate,
  productController.createProduct
);

/**
 * @openapi
 * /products/export/csv:
 *   get:
 *     tags: [Products]
 *     summary: Export all products as CSV
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CSV file }
 */
router.get("/export/csv", productController.exportProducts);

/**
 * @openapi
 * /products/import/csv:
 *   post:
 *     tags: [Products]
 *     summary: Bulk import products from a CSV file (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Import summary }
 */
router.post("/import/csv", authorize("admin", "user"), csvUpload.single("file"), productController.importProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product }
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product updated }
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product deleted }
 */
router.get("/:id", productIdValidator, validate, productController.getProduct);
router.put(
  "/:id",
  authorize("admin", "user"),
  uploadProductImage,
  productIdValidator,
  validate,
  productController.updateProduct
);
router.delete("/:id", authorize("admin", "user"), productIdValidator, validate, productController.deleteProduct);

export default router;
