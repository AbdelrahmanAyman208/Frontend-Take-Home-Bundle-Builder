import { Router, type Request, type Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Bundle } from "../models/Bundle.js";
import { Product } from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema } from "../schemas/checkout.schema.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Mock checkout with Inventory Locking
 *     description: >
 *       Checkout endpoint using MongoDB transactions and pessimistic locking (atomic updates)
 *       to prevent overselling. Validates inventory, deducts stock, and marks bundle as checked_out.
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bundleId]
 *             properties:
 *               bundleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout confirmation
 *       400:
 *         description: Out of stock or invalid bundle
 *       404:
 *         description: Bundle not found
 */
router.post(
  "/",
  validate({ body: checkoutSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    const { bundleId } = req.body;

    try {
      const bundle = await Bundle.findOne({
        _id: bundleId,
        status: "active",
      });

      if (!bundle) {
        throw new AppError(404, "Bundle not found or already checked out");
      }

      if (bundle.items.length === 0) {
        throw new AppError(400, "Cannot checkout an empty bundle");
      }

      // Atomically check and deduct stock for each item
      for (const item of bundle.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            variants: {
              $elemMatch: {
                _id: item.variantId,
                stock: { $gte: item.quantity },
              },
            },
          },
          {
            $inc: { "variants.$.stock": -item.quantity },
          },
          { new: true }
        );

        if (!product) {
          throw new AppError(
            400,
            `Sorry, product ${item.productId} (Variant ${item.variantId}) does not have enough stock.`
          );
        }
      }

      // Mark as checked out
      bundle.status = "checked_out";
      await bundle.save();

      // Mock delivery estimate: 5-7 business days from now
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);

      res.json({
        success: true,
        orderId: uuidv4(),
        bundleId: bundle._id,
        totalPrice: bundle.totalPrice,
        savings: bundle.savings,
        itemCount: bundle.items.reduce((sum, item) => sum + item.quantity, 0),
        estimatedDelivery: deliveryDate.toISOString().split("T")[0],
        message: "Order confirmed! Inventory successfully reserved.",
      });
    } catch (error) {
      next(error); // Pass to global error handler
    }
  },
);

export default router;
