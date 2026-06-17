import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().regex(objectIdRegex, "Invalid ObjectId");

export const checkoutSchema = z.object({
  bundleId: objectId,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
