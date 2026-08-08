import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters"),
  body("email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("password").isLength({ min: 6, max: 72 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const refreshValidator = [
  body("refreshToken").optional().isString(),
];
