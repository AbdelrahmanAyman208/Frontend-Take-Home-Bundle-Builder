import { Router, type Request, type Response } from "express";
import { Product } from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List products
 *     description: Fetch product catalog with optional category filter and cursor-based pagination.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [camera, sensor, accessory]
 *         description: Filter by product category
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Last product _id for cursor-based pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Product list
 */
router.get("/", async (req: Request, res: Response) => {
  const { category, cursor, limit: limitStr } = req.query;
  const limit = Math.min(parseInt((limitStr as string) ?? "20", 10) || 20, 100);

  const filter: Record<string, unknown> = {};

  if (category && ["camera", "sensor", "accessory"].includes(category as string)) {
    filter.category = category;
  }

  if (cursor && typeof cursor === "string") {
    filter._id = { $gt: cursor };
  }

  const products = await Product.find(filter)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const nextCursor =
    products.length === limit
      ? products[products.length - 1]._id.toString()
      : null;

  res.json({
    data: products,
    pagination: {
      nextCursor,
      count: products.length,
      limit,
    },
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get single product
 *     description: Fetch a single product with all variants by ID.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ObjectId
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/:id", async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  res.json({ data: product });
});

export default router;
