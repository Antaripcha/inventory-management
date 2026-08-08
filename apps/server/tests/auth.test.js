import request from "supertest";
import { jest } from "@jest/globals";
import { createApp } from "../src/app.js";
import { connect, closeDatabase, clearDatabase } from "./setup.js";

jest.setTimeout(30000);

let app;

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

describe("Auth API", () => {
  const user = { name: "Test User", email: "test@example.com", password: "Password123" };

  it("registers a new user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(user.email);
    // first registered user becomes admin
    expect(res.body.data.user.role).toBe("admin");
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(409);
  });

  it("rejects registration with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...user, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("returns current user for authenticated request", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(user);
    const token = registerRes.body.data.accessToken;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
  });

  it("rejects unauthenticated request to /me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
