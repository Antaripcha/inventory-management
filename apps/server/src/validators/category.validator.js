import { body, param } from "express-validator";

export const categoryValidator = [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Category name must be 2-60 characters"),
  body("description").optional({ checkFalsy: true }).isLength({ max: 500 }),
];

export const idParamValidator = [
  param("id").isMongoId().withMessage("Invalid id"),
];
