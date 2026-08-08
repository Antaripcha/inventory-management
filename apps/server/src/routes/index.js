import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import auditRoutes from "./audit.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audit-logs", auditRoutes);

router.get("/health", (req, res) => res.json({ success: true, message: "OK", timestamp: new Date() }));

export default router;
