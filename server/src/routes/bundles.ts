import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Bundle } from "../models/Bundle.js";
import { Product } from "../models/Product.js";
import { Plan } from "../models/Plan.js";
import { AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import {
  createBundleSchema,
  updateBundleSchema,
  saveBundleSchema,
  bundleParamsSchema,
} from "../schemas/bundle.schema.js";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function mapItemsToDb(
  items: Array<{ productId: string; variantId: string; quantity: number; price: number }>
) {
  const mapped = [];
  for (const item of items) {
    const product = await Product.findOne({
      $or: [{ _id: mongoose.isValidObjectId(item.productId) ? item.productId : undefined }, { slug: item.productId }]
    }).lean();
    
    if (!product) continue;

    let variant = product.variants.find(
      (v) => v._id.toString() === item.variantId
    );

    // If not found by ObjectId, try to find by label (case-insensitive) mapped to frontend variantId
    if (!variant) {
       variant = product.variants.find((v) => {
         const lower = v.label.toLowerCase();
         if (lower === "white" && item.variantId === "default" && product.category === "sensor") return true;
         return lower === item.variantId;
       });
    }
    
    // Fallback to first variant
    if (!variant) variant = product.variants[0];

    mapped.push({
      productId: product._id,
      variantId: variant._id,
      quantity: item.quantity,
      price: variant.price
    });
  }
  return mapped;
}

async function calculateTotals(
  items: Array<{ productId: any; variantId: any; quantity: number; price: number }>,
  planId?: string | null,
) {
  let totalPrice = 0;
  let compareAtTotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId).lean();
    if (!product) continue;

    const variant = product.variants.find(
      (v) => v._id.toString() === item.variantId.toString(),
    );
    if (!variant) continue;

    totalPrice += variant.price * item.quantity;
    compareAtTotal += (variant.compareAt ?? variant.price) * item.quantity;
  }

  let dbPlanId = null;
  if (planId) {
    const plan = await Plan.findOne({
      $or: [{ _id: mongoose.isValidObjectId(planId) ? planId : undefined }, { slug: planId }]
    }).lean();
    if (plan) {
      dbPlanId = plan._id;
    }
  }

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    savings: Math.round(Math.max(0, compareAtTotal - totalPrice) * 100) / 100,
    dbPlanId,
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/bundles:
 *   post:
 *     summary: Create a new bundle
 *     tags: [Bundles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               planId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Bundle created
 */
router.post(
  "/",
  validate({ body: createBundleSchema }),
  async (req: Request, res: Response) => {
    const { items, planId } = req.body;
    const sessionId = req.body.sessionId ?? uuidv4();

    const mappedItems = await mapItemsToDb(items);
    const { totalPrice, savings, dbPlanId } = await calculateTotals(mappedItems, planId);

    const bundle = await Bundle.create({
      sessionId,
      items: mappedItems,
      planId: dbPlanId ?? null,
      totalPrice,
      savings,
    });

    res.status(201).json({ data: bundle.toObject() });
  },
);

/**
 * @swagger
 * /api/bundles/save:
 *   post:
 *     summary: Save bundle configuration
 *     description: Upserts the latest bundle for a session ID.
 *     tags: [Bundles]
 *     responses:
 *       200:
 *         description: Bundle saved
 */
router.post(
  "/save",
  validate({ body: saveBundleSchema }),
  async (req: Request, res: Response) => {
    const { sessionId, items, planId } = req.body;
    const mappedItems = await mapItemsToDb(items);
    const { totalPrice, savings, dbPlanId } = await calculateTotals(mappedItems, planId);

    const bundle = await Bundle.findOneAndUpdate(
      { sessionId, status: "active" },
      {
        items: mappedItems,
        planId: dbPlanId ?? null,
        totalPrice,
        savings,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    res.json({ data: bundle });
  },
);

/**
 * @swagger
 * /api/bundles/load:
 *   get:
 *     summary: Load saved bundle
 *     description: Retrieve the most recent active bundle for a session.
 *     tags: [Bundles]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Bundle loaded
 *       404:
 *         description: No bundle found
 */
router.get("/load", async (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError(400, "sessionId query parameter is required");
  }

  const bundle = await Bundle.findOne({
    sessionId,
    status: "active",
  })
    .sort({ updatedAt: -1 })
    .populate("items.productId", "title slug image category")
    .populate("planId", "title slug price")
    .lean();

  if (!bundle) {
    throw new AppError(404, "No saved bundle found for this session");
  }

  res.json({ data: bundle });
});

/**
 * @swagger
 * /api/bundles/{id}:
 *   get:
 *     summary: Get bundle by ID
 *     tags: [Bundles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bundle details
 *       404:
 *         description: Bundle not found
 */
router.get(
  "/:id",
  validate({ params: bundleParamsSchema }),
  async (req: Request, res: Response) => {
    const bundle = await Bundle.findOne({
      _id: req.params.id,
      status: { $ne: "deleted" },
    })
      .populate("items.productId", "title slug image category variants")
      .populate("planId", "title slug price compareAt tagline")
      .lean();

    if (!bundle) {
      throw new AppError(404, "Bundle not found");
    }

    res.json({ data: bundle });
  },
);

/**
 * @swagger
 * /api/bundles/{id}:
 *   put:
 *     summary: Update bundle
 *     tags: [Bundles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bundle updated
 *       404:
 *         description: Bundle not found
 */
router.put(
  "/:id",
  validate({ params: bundleParamsSchema, body: updateBundleSchema }),
  async (req: Request, res: Response) => {
    const existing = await Bundle.findOne({
      _id: req.params.id,
      status: "active",
    });

    if (!existing) {
      throw new AppError(404, "Bundle not found");
    }

    const items = req.body.items ?? existing.items;
    const planId = req.body.planId !== undefined ? req.body.planId : existing.planId;

    const mappedItems = await mapItemsToDb(items);

    const { totalPrice, savings, dbPlanId } = await calculateTotals(
      mappedItems,
      planId?.toString(),
    );

    existing.items = mappedItems as any;
    existing.planId = dbPlanId as any;
    existing.totalPrice = totalPrice;
    existing.savings = savings;
    await existing.save();

    res.json({ data: existing.toObject() });
  },
);

/**
 * @swagger
 * /api/bundles/{id}:
 *   delete:
 *     summary: Delete bundle (soft delete)
 *     tags: [Bundles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bundle deleted
 *       404:
 *         description: Bundle not found
 */
router.delete(
  "/:id",
  validate({ params: bundleParamsSchema }),
  async (req: Request, res: Response) => {
    const bundle = await Bundle.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { status: "deleted" },
      { new: true },
    ).lean();

    if (!bundle) {
      throw new AppError(404, "Bundle not found");
    }

    res.json({ message: "Bundle deleted", data: { id: bundle._id } });
  },
);

export default router;
