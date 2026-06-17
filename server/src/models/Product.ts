import mongoose, { Schema, type InferSchemaType } from "mongoose";

const variantSchema = new Schema(
  {
    label: { type: String, required: true },
    swatch: { type: String, default: null },
    thumb: { type: String, default: null },
    image: { type: String, default: null },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null, min: 0 },
    stock: { type: Number, required: true, default: 10, min: 0 },
  },
  { _id: true },
);

const productSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["camera", "sensor", "accessory"],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    badge: { type: String, default: null },
    required: { type: Boolean, default: false },
    freeWhenAnySensor: { type: Boolean, default: false },
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "Product must have at least one variant",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for category-based filtering with cursor pagination
productSchema.index({ category: 1, _id: 1 });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const Product = mongoose.model("Product", productSchema);
