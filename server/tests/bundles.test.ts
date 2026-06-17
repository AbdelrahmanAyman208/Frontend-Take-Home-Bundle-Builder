import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import supertest from "supertest";
import express from "express";
import { setupTestDB, teardownTestDB, clearCollections } from "./setup.js";
import { Product } from "../src/models/Product.js";
import { Plan } from "../src/models/Plan.js";
import { Bundle } from "../src/models/Bundle.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import bundleRoutes from "../src/routes/bundles.js";
import checkoutRoutes from "../src/routes/checkout.js";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/bundles", bundleRoutes);
  app.use("/api/checkout", checkoutRoutes);
  app.use(errorHandler);
  return app;
}

describe("Bundles API", () => {
  let request: supertest.Agent;
  let testProduct: Awaited<ReturnType<typeof Product.create>>;
  let testPlan: Awaited<ReturnType<typeof Plan.create>>;

  beforeAll(async () => {
    await setupTestDB();
    request = supertest.agent(createApp());
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    // Create test fixtures
    testProduct = await Product.create({
      slug: "cam-v4",
      category: "camera",
      title: "Wyze Cam v4",
      image: "/cam.png",
      variants: [
        { label: "White", swatch: "#fff", price: 27.98, compareAt: 35.98 },
        { label: "Black", swatch: "#000", price: 27.98, compareAt: 35.98 },
      ],
    });

    testPlan = await Plan.create({
      slug: "cam-unlimited",
      title: "Cam Unlimited",
      tagline: "All cameras",
      price: 9.99,
      compareAt: 12.99,
    });
  });

  describe("POST /api/bundles", () => {
    it("should create a bundle with items", async () => {
      const variant = testProduct.variants[0];

      const res = await request.post("/api/bundles").send({
        items: [
          {
            productId: testProduct._id.toString(),
            variantId: variant._id.toString(),
            quantity: 2,
            price: variant.price,
          },
        ],
        planId: testPlan._id.toString(),
      });

      expect(res.status).toBe(201);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.totalPrice).toBeCloseTo(55.96, 2);
      expect(res.body.data.savings).toBeCloseTo(16.0, 2);
      expect(res.body.data.sessionId).toBeTruthy();
    });

    it("should create an empty bundle", async () => {
      const res = await request.post("/api/bundles").send({
        items: [],
      });

      expect(res.status).toBe(201);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.totalPrice).toBe(0);
    });

    it("should reject invalid items", async () => {
      const res = await request.post("/api/bundles").send({
        items: [
          {
            productId: "not-an-id",
            variantId: "also-bad",
            quantity: -1,
            price: 10,
          },
        ],
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/bundles/:id", () => {
    it("should return a bundle with populated data", async () => {
      const variant = testProduct.variants[0];

      const bundle = await Bundle.create({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        items: [
          {
            productId: testProduct._id,
            variantId: variant._id,
            quantity: 1,
            price: variant.price,
          },
        ],
        planId: testPlan._id,
        totalPrice: 27.98,
        savings: 8.0,
      });

      const res = await request.get(`/api/bundles/${bundle._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items[0].productId).toBeTruthy();
      expect(res.body.data.planId).toBeTruthy();
    });

    it("should return 404 for deleted bundle", async () => {
      const bundle = await Bundle.create({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        items: [],
        totalPrice: 0,
        savings: 0,
        status: "deleted",
      });

      const res = await request.get(`/api/bundles/${bundle._id}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/bundles/:id", () => {
    it("should update bundle items and recalculate totals", async () => {
      const variant = testProduct.variants[0];
      const variant2 = testProduct.variants[1];

      const bundle = await Bundle.create({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        items: [
          {
            productId: testProduct._id,
            variantId: variant._id,
            quantity: 1,
            price: variant.price,
          },
        ],
        totalPrice: 27.98,
        savings: 8.0,
      });

      const res = await request.put(`/api/bundles/${bundle._id}`).send({
        items: [
          {
            productId: testProduct._id.toString(),
            variantId: variant2._id.toString(),
            quantity: 3,
            price: variant2.price,
          },
        ],
      });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.totalPrice).toBeCloseTo(83.94, 2);
    });
  });

  describe("DELETE /api/bundles/:id", () => {
    it("should soft-delete a bundle", async () => {
      const bundle = await Bundle.create({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        items: [],
        totalPrice: 0,
        savings: 0,
      });

      const res = await request.delete(`/api/bundles/${bundle._id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Bundle deleted");

      // Verify it's soft-deleted
      const deleted = await Bundle.findById(bundle._id);
      expect(deleted?.status).toBe("deleted");
    });
  });

  describe("POST /api/bundles/save + GET /api/bundles/load", () => {
    it("should save and load a bundle by session ID", async () => {
      const sessionId = "550e8400-e29b-41d4-a716-446655440000";
      const variant = testProduct.variants[0];

      // Save
      const saveRes = await request.post("/api/bundles/save").send({
        sessionId,
        items: [
          {
            productId: testProduct._id.toString(),
            variantId: variant._id.toString(),
            quantity: 1,
            price: variant.price,
          },
        ],
        planId: testPlan._id.toString(),
      });

      expect(saveRes.status).toBe(200);

      // Load
      const loadRes = await request.get(
        `/api/bundles/load?sessionId=${sessionId}`,
      );

      expect(loadRes.status).toBe(200);
      expect(loadRes.body.data.items).toHaveLength(1);
      expect(loadRes.body.data.sessionId).toBe(sessionId);
    });

    it("should upsert on repeated saves", async () => {
      const sessionId = "550e8400-e29b-41d4-a716-446655440000";

      // First save
      await request.post("/api/bundles/save").send({
        sessionId,
        items: [],
      });

      // Second save with items
      const variant = testProduct.variants[0];
      await request.post("/api/bundles/save").send({
        sessionId,
        items: [
          {
            productId: testProduct._id.toString(),
            variantId: variant._id.toString(),
            quantity: 2,
            price: variant.price,
          },
        ],
      });

      // Should only have 1 bundle for this session
      const count = await Bundle.countDocuments({ sessionId });
      expect(count).toBe(1);

      const loadRes = await request.get(
        `/api/bundles/load?sessionId=${sessionId}`,
      );
      expect(loadRes.body.data.items).toHaveLength(1);
      expect(loadRes.body.data.items[0].quantity).toBe(2);
    });
  });
});

describe("Checkout API", () => {
  let request: supertest.Agent;

  beforeAll(async () => {
    // DB already connected
    request = supertest.agent(createApp());
  });

  beforeEach(async () => {
    await clearCollections();
  });

  it("should checkout a valid bundle", async () => {
    const product = await Product.create({
      slug: "cam-test",
      category: "camera",
      title: "Test Cam",
      image: "/test.png",
      variants: [{ label: "White", price: 29.99 }],
    });

    const bundle = await Bundle.create({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      items: [
        {
          productId: product._id,
          variantId: product.variants[0]._id,
          quantity: 1,
          price: 29.99,
        },
      ],
      totalPrice: 29.99,
      savings: 0,
    });

    const res = await request.post("/api/checkout").send({
      bundleId: bundle._id.toString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orderId).toBeTruthy();
    expect(res.body.estimatedDelivery).toBeTruthy();
    expect(res.body.totalPrice).toBe(29.99);

    // Verify bundle is marked as checked_out
    const updated = await Bundle.findById(bundle._id);
    expect(updated?.status).toBe("checked_out");
  });

  it("should reject checkout of empty bundle", async () => {
    const bundle = await Bundle.create({
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      items: [],
      totalPrice: 0,
      savings: 0,
    });

    const res = await request.post("/api/checkout").send({
      bundleId: bundle._id.toString(),
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("empty bundle");
  });

  it("should reject checkout of non-existent bundle", async () => {
    const res = await request.post("/api/checkout").send({
      bundleId: "507f1f77bcf86cd799439011",
    });

    expect(res.status).toBe(404);
  });
});
