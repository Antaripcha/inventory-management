import { Parser } from "json2csv";
import { Product, Category } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";

const CSV_FIELDS = [
  "name",
  "sku",
  "category",
  "description",
  "quantity",
  "price",
  "supplier",
  "barcode",
  "status",
  "createdAt",
  "updatedAt",
];

export async function exportProductsToCSV(userId) {
  const products = await Product.find({ user: userId }).populate("category", "name").lean();
  const rows = products.map((p) => ({
    ...p,
    category: p.category?.name || "",
  }));
  const parser = new Parser({ fields: CSV_FIELDS });
  return parser.parse(rows);
}

/**
 * Parses simple CSV text (no external CSV-parsing dependency needed for the
 * expected column set) into product rows and upserts them by SKU.
 * Expected header: name,sku,category,description,quantity,price,supplier,barcode
 */
export async function importProductsFromCSV(csvText, userId) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw ApiError.badRequest("CSV file must contain a header row and at least one data row");
  }

  const header = lines[0].split(",").map((h) => h.trim());
  const required = ["name", "sku", "category", "quantity", "price"];
  for (const field of required) {
    if (!header.includes(field)) {
      throw ApiError.badRequest(`CSV is missing required column: ${field}`);
    }
  }

  const results = { created: 0, updated: 0, failed: [] };

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const row = Object.fromEntries(header.map((h, idx) => [h, cols[idx]]));

    try {
      let category = await Category.findOne({ user: userId, name: row.category });
      if (!category) {
        category = await Category.create({ user: userId, name: row.category, createdBy: userId });
      }

      const payload = {
        user: userId,
        name: row.name,
        sku: row.sku?.toUpperCase(),
        category: category._id,
        description: row.description || "",
        quantity: Number(row.quantity) || 0,
        price: Number(row.price) || 0,
        supplier: row.supplier || "",
        barcode: row.barcode || null,
        updatedBy: userId,
      };

      const existing = await Product.findOne({ user: userId, sku: payload.sku });
      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        results.updated += 1;
      } else {
        payload.createdBy = userId;
        await Product.create(payload);
        results.created += 1;
      }
    } catch (err) {
      results.failed.push({ row: i + 1, error: err.message });
    }
  }

  return results;
}
