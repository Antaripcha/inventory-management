import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String, trim: true, maxlength: 300, default: "" },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ user: 1, createdAt: -1 });

export const InventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);
