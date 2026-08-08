import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(60),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(120),
  sku: z
    .string()
    .min(2, "SKU is required")
    .max(40)
    .regex(/^[A-Za-z0-9-_]+$/, "SKU may only contain letters, numbers, - and _"),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(1000).optional().or(z.literal("")),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  supplier: z.string().max(120).optional().or(z.literal("")),
  barcode: z.string().max(60).optional().or(z.literal("")),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export const inventoryAdjustSchema = z.object({
  type: z.enum(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int()
    .positive("Quantity must be greater than 0"),
  reason: z.string().max(300).optional().or(z.literal("")),
});
