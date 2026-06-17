export type StepId = "cameras" | "plan" | "sensors" | "accessories";

export interface Variant {
  id: string;
  label: string;
  swatch?: string; // hex/color for chip dot
  thumb?: string; // optional thumbnail shown inside the variant chip
  image?: string; // optional product image override when this variant is active
  price: number;
  compareAt?: number;
}

export interface Product {
  id: string;
  step: StepId;
  title: string;
  description?: string;
  image: string;
  alt: string;
  badge?: string; // "Save 22%"
  variants: Variant[];
  required?: boolean; // hub
  freeWhenAnySensor?: boolean;
}

export interface Plan {
  id: string;
  title: string;
  tagline: string;
  price: number; // monthly
  compareAt?: number;
}

export interface BundleState {
  // key = `${productId}:${variantId}` -> qty
  items: Record<string, number>;
  planId: string | null;
  openStep: 1 | 2 | 3 | 4 | null;
  // remembers which variant chip is active per product
  activeVariant: Record<string, string>;
}
