import mongoose from "mongoose";
import { LOW_STOCK_THRESHOLD, computeStatus } from "@inventory/types";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 40,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0.01 },
    supplier: { type: String, trim: true, maxlength: 120, default: "" },
    image: { type: String, default: null },
    barcode: { type: String, trim: true, maxlength: 60, default: null },
    lowStockThreshold: { type: Number, default: LOW_STOCK_THRESHOLD, min: 0 },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text" });

productSchema.pre("save", function setStatus(next) {
  this.status = computeStatus(this.quantity, this.lowStockThreshold);
  next();
});

productSchema.pre(["findOneAndUpdate"], function setStatusOnUpdate(next) {
  const update = this.getUpdate();
  const qty = update.quantity ?? update.$set?.quantity;
  if (qty !== undefined) {
    const threshold =
      update.lowStockThreshold ?? update.$set?.lowStockThreshold ?? LOW_STOCK_THRESHOLD;
    const status = computeStatus(qty, threshold);
    if (update.$set) update.$set.status = status;
    else update.status = status;
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
