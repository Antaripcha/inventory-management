import request from "supertest";
import { jest } from "@jest/globals";
import { createApp } from "../src/app.js";
import { connect, closeDatabase, clearDatabase } from "./setup.js";

jest.setTimeout(30000);

let app;
let token;
let categoryId;

async function registerAndLogin() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: "admin@test.com",
    password: "Password123",
  });
  return res.body.data.accessToken;
}

beforeAll(async () => {
  await connect();
  app = createApp();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  token = await registerAndLogin();
  const catRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Electronics", description: "Gadgets" });
  categoryId = catRes.body.data._id;
});

describe("Category API", () => {
  it("prevents duplicate category names", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Electronics" });
    expect(res.status).toBe(409);
  });
});

describe("Product API", () => {
  const basePayload = () => ({
    name: "Wireless Mouse",
    sku: "MOU-1001",
    category: categoryId,
    quantity: 15,
    price: 19.99,
  });

  it("creates a product with valid data", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", basePayload().name)
      .field("sku", basePayload().sku)
      .field("category", categoryId)
      .field("quantity", "15")
      .field("price", "19.99");

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("In Stock");
  });

  it("rejects duplicate SKU", async () => {
    await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Mouse 1")
      .field("sku", "DUP-001")
      .field("category", categoryId)
      .field("quantity", "10")
      .field("price", "10");

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Mouse 2")
      .field("sku", "DUP-001")
      .field("category", categoryId)
      .field("quantity", "5")
      .field("price", "5");

    expect(res.status).toBe(409);
  });

  it("rejects negative price/quantity", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Bad Product")
      .field("sku", "BAD-001")
      .field("category", categoryId)
      .field("quantity", "-5")
      .field("price", "-1");

    expect(res.status).toBe(400);
  });

  it("enforces strict per-user data isolation", async () => {
    const user2Res = await request(app).post("/api/auth/register").send({
      name: "User Two",
      email: "user2@test.com",
      password: "Password123",
    });
    const token2 = user2Res.body.data.accessToken;

    const p1Res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "User 1 Product")
      .field("sku", "U1-001")
      .field("category", categoryId)
      .field("quantity", "10")
      .field("price", "20");
    expect(p1Res.status).toBe(201);

    const list2 = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token2}`);
    expect(list2.status).toBe(200);
    expect(list2.body.data.length).toBe(0);

    const get2 = await request(app)
      .get(`/api/products/${p1Res.body.data._id}`)
      .set("Authorization", `Bearer ${token2}`);
    expect(get2.status).toBe(404);
  });
});

describe("Inventory API", () => {
  let productId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Test Product")
      .field("sku", "TST-001")
      .field("category", categoryId)
      .field("quantity", "10")
      .field("price", "5");
    productId = res.body.data._id;
  });

  it("increases stock with STOCK_IN", async () => {
    const res = await request(app)
      .post(`/api/inventory/${productId}/adjust`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "STOCK_IN", quantity: 5, reason: "Restock" });

    expect(res.status).toBe(200);
    expect(res.body.data.product.quantity).toBe(15);
  });

  it("prevents stock from going negative", async () => {
    const res = await request(app)
      .post(`/api/inventory/${productId}/adjust`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "STOCK_OUT", quantity: 100, reason: "Big order" });

    expect(res.status).toBe(400);
  });

  it("records a transaction history entry", async () => {
    await request(app)
      .post(`/api/inventory/${productId}/adjust`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "STOCK_OUT", quantity: 3, reason: "Order" });

    const res = await request(app)
      .get(`/api/inventory/${productId}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].newQuantity).toBe(7);
  });
});
