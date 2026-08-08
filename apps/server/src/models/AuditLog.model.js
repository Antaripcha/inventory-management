import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "STOCK_CHANGE"],
      required: true,
    },
    entity: { type: String, required: true }, // e.g. "Product", "Category"
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
