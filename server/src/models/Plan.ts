import mongoose, { Schema, type InferSchemaType } from "mongoose";

const planSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type PlanDocument = InferSchemaType<typeof planSchema>;
export const Plan = mongoose.model("Plan", planSchema);
