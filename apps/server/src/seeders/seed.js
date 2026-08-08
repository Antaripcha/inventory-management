/* eslint-disable no-console */
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { User, Category, Product, InventoryTransaction, AuditLog, RefreshToken } from "../models/index.js";

const categories = [
  { name: "Electronics", description: "Phones, laptops, accessories and gadgets" },
  { name: "Office Supplies", description: "Stationery, paper, printer supplies" },
  { name: "Furniture", description: "Desks, chairs, storage units" },
  { name: "Groceries", description: "Packaged food and beverages" },
  { name: "Apparel", description: "Clothing and accessories" },
];

const supplierPool = ["Acme Supplies Co.", "Global Traders Ltd.", "Northwind Distribution", "Prime Vendors Inc."];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function seed() {
  console.log("Connecting to database...");
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    InventoryTransaction.deleteMany({}),
    AuditLog.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);

  console.log("Creating users...");
  const admin = await User.create({
    name: "Admin User",
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: "admin",
  });

  const staff = await User.create({
    name: "Staff User",
    email: "staff@inventory.com",
    password: "Staff@12345",
    role: "user",
  });

  console.log("Creating categories...");
  const createdCategories = await Category.insertMany(
    categories.map((c) => ({ ...c, user: admin._id, createdBy: admin._id }))
  );

  console.log("Creating products...");
  const productNames = {
    Electronics: ["Wireless Mouse", "Mechanical Keyboard", "27in Monitor", "USB-C Hub", "Bluetooth Speaker", "Webcam HD"],
    "Office Supplies": ["A4 Paper Ream", "Ballpoint Pens (Box)", "Stapler", "Sticky Notes", "Whiteboard Markers"],
    Furniture: ["Ergonomic Chair", "Standing Desk", "Bookshelf", "Filing Cabinet"],
    Groceries: ["Instant Coffee Jar", "Green Tea Box", "Granola Bars (Pack)", "Bottled Water (Case)"],
    Apparel: ["Cotton T-Shirt", "Hooded Sweatshirt", "Baseball Cap"],
  };

  const products = [];
  for (const category of createdCategories) {
    const names = productNames[category.name] || [];
    for (const name of names) {
      const quantity = randomInt(0, 60);
      products.push({
        user: admin._id,
        name,
        sku: `${category.name.slice(0, 3).toUpperCase()}-${randomInt(1000, 9999)}`,
        category: category._id,
        description: `${name} — quality item from the ${category.name} range.`,
        quantity,
        price: randomPrice(4, 250),
        supplier: supplierPool[randomInt(0, supplierPool.length - 1)],
        barcode: `${randomInt(100000000000, 999999999999)}`,
        createdBy: admin._id,
        updatedBy: admin._id,
      });
    }
  }

  const createdProducts = await Product.insertMany(products);

  console.log("Creating inventory transactions...");
  const transactions = [];
  for (const product of createdProducts) {
    const initialQty = randomInt(20, 80);
    transactions.push({
      user: admin._id,
      product: product._id,
      type: "STOCK_IN",
      quantity: initialQty,
      previousQuantity: 0,
      newQuantity: initialQty,
      reason: "Initial stock",
      performedBy: admin._id,
      createdAt: new Date(Date.now() - randomInt(5, 20) * 86400000),
    });

    if (Math.random() > 0.5) {
      const outQty = randomInt(1, Math.min(10, initialQty));
      transactions.push({
        user: admin._id,
        product: product._id,
        type: "STOCK_OUT",
        quantity: outQty,
        previousQuantity: initialQty,
        newQuantity: initialQty - outQty,
        reason: "Order fulfillment",
        performedBy: staff._id,
        createdAt: new Date(Date.now() - randomInt(0, 4) * 86400000),
      });
    }
  }
  await InventoryTransaction.insertMany(transactions);

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${env.SEED_ADMIN_EMAIL} / password: ${env.SEED_ADMIN_PASSWORD}`);
  console.log("Staff login -> email: staff@inventory.com / password: Staff@12345");

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
