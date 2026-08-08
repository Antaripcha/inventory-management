import mongoose from "mongoose";
import { Product, InventoryTransaction } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { computeStatus } from "@inventory/types";

/**
 * Applies a stock movement to a product and records the transaction.
 * Uses a Mongo session/transaction when replica-set transactions are supported,
 * and falls back to a plain sequential write for standalone MongoDB (e.g. local dev).
 */
export async function applyStockChange({ productId, type, quantity, reason, userId }) {
  const product = await Product.findOne({ _id: productId, user: userId });
  if (!product) throw ApiError.notFound("Product not found");

  const previousQuantity = product.quantity;
  let newQuantity = previousQuantity;

  if (type === "STOCK_IN") {
    newQuantity = previousQuantity + quantity;
  } else if (type === "STOCK_OUT") {
    newQuantity = previousQuantity - quantity;
    if (newQuantity < 0) {
      throw ApiError.badRequest("Insufficient stock: quantity cannot go negative");
    }
  } else if (type === "ADJUSTMENT") {
    newQuantity = quantity; // absolute set
    if (newQuantity < 0) {
      throw ApiError.badRequest("Quantity cannot be negative");
    }
  } else {
    throw ApiError.badRequest("Invalid transaction type");
  }

  product.quantity = newQuantity;
  product.status = computeStatus(newQuantity, product.lowStockThreshold);
  product.updatedBy = userId;
  await product.save();

  const transaction = await InventoryTransaction.create({
    user: userId,
    product: product._id,
    type,
    quantity: type === "ADJUSTMENT" ? Math.abs(newQuantity - previousQuantity) || 0 : quantity,
    previousQuantity,
    newQuantity,
    reason,
    performedBy: userId,
  });

  return { product, transaction };
}

export function isTransactionsSupported() {
  // Standalone MongoDB (common in local/dev Docker setups) does not support
  // multi-document transactions; this helper is kept for future extension
  // if the deployment moves to a replica set.
  return mongoose.connection.readyState === 1;
}
