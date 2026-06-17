import mongoose, { Schema, type InferSchemaType } from "mongoose";

const bundleItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const bundleSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, default: null },
    items: { type: [bundleItemSchema], default: [] },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
    totalPrice: { type: Number, required: true, default: 0, min: 0 },
    savings: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["active", "checked_out", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for quick retrieval of a user's most recent bundle
bundleSchema.index({ sessionId: 1, updatedAt: -1 });
bundleSchema.index({ userId: 1, updatedAt: -1 });

export type BundleDocument = InferSchemaType<typeof bundleSchema>;
export const Bundle = mongoose.model("Bundle", bundleSchema);
