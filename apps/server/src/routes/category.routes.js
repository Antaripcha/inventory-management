import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { categoryValidator, idParamValidator } from "../validators/category.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories with product counts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of categories }
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Category created }
 */
router.get("/", categoryController.listCategories);
router.post("/", authorize("admin", "user"), categoryValidator, validate, categoryController.createCategory);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by id
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category }
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category updated }
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category deleted }
 */
router.get("/:id", idParamValidator, validate, categoryController.getCategory);
router.put(
  "/:id",
  authorize("admin", "user"),
  idParamValidator,
  categoryValidator,
  validate,
  categoryController.updateCategory
);
router.delete("/:id", authorize("admin", "user"), idParamValidator, validate, categoryController.deleteCategory);

export default router;
