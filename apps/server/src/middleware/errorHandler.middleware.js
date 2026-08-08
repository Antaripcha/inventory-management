import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate value";
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  if (!err.isOperational && statusCode === 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    details,
    ...(env.NODE_ENV === "development" && !err.isOperational ? { stack: err.stack } : {}),
  });
}
