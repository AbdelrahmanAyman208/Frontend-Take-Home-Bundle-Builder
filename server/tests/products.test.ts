import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import supertest from "supertest";
import express from "express";
import { setupTestDB, teardownTestDB, clearCollections } from "./setup.js";
import { Product } from "../src/models/Product.js";
import { Plan } from "../src/models/Plan.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import productRoutes from "../src/routes/products.js";
import planRoutes from "../src/routes/plans.js";

// Create a minimal test app
function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/products", productRoutes);
  app.use("/api/plans", planRoutes);
  app.use(errorHandler);
  return app;
}

describe("Products API", () => {
  let request: supertest.Agent;

  beforeAll(async () => {
    await setupTestDB();
    request = supertest.agent(createApp());
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("GET /api/products", () => {
    it("should return empty array when no products exist", async () => {
      const res = await request.get("/api/products");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.count).toBe(0);
    });

    it("should return seeded products", async () => {
      await Product.create({
        slug: "test-cam",
        category: "camera",
        title: "Test Camera",
        image: "/test.png",
        variants: [{ label: "Default", price: 29.99 }],
      });

      const res = await request.get("/api/products");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Test Camera");
    });

    it("should filter by category", async () => {
      await Product.create([
        {
          slug: "cam-1",
          category: "camera",
          title: "Camera",
          image: "/cam.png",
          variants: [{ label: "Default", price: 29.99 }],
        },
        {
          slug: "sensor-1",
          category: "sensor",
          title: "Sensor",
          image: "/sensor.png",
          variants: [{ label: "Default", price: 19.99 }],
        },
      ]);

      const res = await request.get("/api/products?category=camera");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe("camera");
    });

    it("should support cursor-based pagination", async () => {
      // Create 3 products
      const products = await Product.create([
        { slug: "a", category: "camera", title: "A", image: "/a.png", variants: [{ label: "D", price: 10 }] },
        { slug: "b", category: "camera", title: "B", image: "/b.png", variants: [{ label: "D", price: 20 }] },
        { slug: "c", category: "camera", title: "C", image: "/c.png", variants: [{ label: "D", price: 30 }] },
      ]);

      // Page 1: limit 2
      const page1 = await request.get("/api/products?limit=2");
      expect(page1.body.data).toHaveLength(2);
      expect(page1.body.pagination.nextCursor).toBeTruthy();

      // Page 2: use cursor
      const page2 = await request.get(
        `/api/products?limit=2&cursor=${page1.body.pagination.nextCursor}`,
      );
      expect(page2.body.data).toHaveLength(1);
      expect(page2.body.pagination.nextCursor).toBeNull();
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a single product", async () => {
      const product = await Product.create({
        slug: "test-cam",
        category: "camera",
        title: "Test Camera",
        image: "/test.png",
        variants: [{ label: "White", swatch: "#fff", price: 29.99, compareAt: 39.99 }],
      });

      const res = await request.get(`/api/products/${product._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Test Camera");
      expect(res.body.data.variants).toHaveLength(1);
    });

    it("should return 404 for non-existent product", async () => {
      const res = await request.get("/api/products/507f1f77bcf86cd799439011");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Product not found");
    });
  });
});

describe("Plans API", () => {
  let request: supertest.Agent;

  beforeAll(async () => {
    // DB already connected from Products suite
    request = supertest.agent(createApp());
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("GET /api/plans", () => {
    it("should return all plans", async () => {
      await Plan.create([
        { slug: "basic", title: "Basic", tagline: "Free", price: 0 },
        { slug: "pro", title: "Pro", tagline: "Full features", price: 9.99 },
      ]);

      const res = await request.get("/api/plans");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });
});
