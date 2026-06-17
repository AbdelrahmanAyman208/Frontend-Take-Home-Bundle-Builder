import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");

export const bundleItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0),
});

export const createBundleSchema = z.object({
  sessionId: z.string().uuid().optional(),
  items: z.array(bundleItemSchema).default([]),
  planId: z.string().nullable().optional(),
});

export const updateBundleSchema = z.object({
  items: z.array(bundleItemSchema).optional(),
  planId: z.string().nullable().optional(),
});

export const saveBundleSchema = z.object({
  sessionId: z.string().uuid(),
  items: z.array(bundleItemSchema).default([]),
  planId: z.string().nullable().optional(),
});

export const bundleParamsSchema = z.object({
  id: z.string(),
});

export type CreateBundleInput = z.infer<typeof createBundleSchema>;
export type UpdateBundleInput = z.infer<typeof updateBundleSchema>;
export type SaveBundleInput = z.infer<typeof saveBundleSchema>;
