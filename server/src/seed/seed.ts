/**
 * Seed script — populates MongoDB with the product catalog and plans
 * matching the frontend's catalog.ts exactly.
 *
 * Usage: npm run seed
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../db.js";
import { Product } from "../models/Product.js";
import { Plan } from "../models/Plan.js";
import { logger } from "../logger.js";

// ─── Product Seed Data ────────────────────────────────────────────────────────
// Maps the frontend "step" field to backend "category":
//   cameras → camera, sensors → sensor, accessories → accessory

const productSeed = [
  {
    slug: "cam-v4",
    category: "camera",
    title: "Wyze Cam v4",
    description: "The clearest Wyze Cam ever made.",
    image: "/images/cam-v4-white.png",
    alt: "Wyze Cam v4 indoor security camera with a compact spherical body and large round lens.",
    badge: "Save 22%",
    variants: [
      { label: "White", swatch: "#f4f4f5", thumb: "/images/cam-v4-white.png", image: "/images/cam-v4-white.png", price: 27.98, compareAt: 35.98 },
      { label: "Grey", swatch: "#9ca3af", thumb: "/images/cam-v4-grey.png", image: "/images/cam-v4-grey.png", price: 27.98, compareAt: 35.98 },
      { label: "Black", swatch: "#111827", thumb: "/images/cam-v4-black.png", image: "/images/cam-v4-black.png", price: 27.98, compareAt: 35.98 },
    ],
  },
  {
    slug: "cam-pan-v3",
    category: "camera",
    title: "Wyze Cam Pan v3",
    description: "360° pan and 180° tilt security camera.",
    image: "/images/cam-pan-v3-white.png",
    alt: "Wyze Cam Pan v3 pan-and-tilt security camera with rounded square body and rotating base.",
    badge: "Save 12%",
    variants: [
      { label: "White", swatch: "#f4f4f5", thumb: "/images/cam-pan-v3-white.png", image: "/images/cam-pan-v3-white.png", price: 34.98, compareAt: 39.98 },
      { label: "Black", swatch: "#111827", thumb: "/images/cam-pan-v3-black.png", image: "/images/cam-pan-v3-black.png", price: 34.98, compareAt: 39.98 },
    ],
  },
  {
    slug: "floodlight",
    category: "camera",
    title: "Wyze Cam Floodlight v2",
    description: "2K floodlight camera with a 160° wide-angle view for your garage.",
    image: "/images/floodlight-white.png",
    alt: "Wyze Cam Floodlight v2 outdoor security camera mounted between two LED floodlight panels.",
    badge: "Save 22%",
    variants: [
      { label: "White", swatch: "#f4f4f5", thumb: "/images/floodlight-white.png", image: "/images/floodlight-white.png", price: 69.98, compareAt: 89.98 },
      { label: "Black", swatch: "#111827", thumb: "/images/floodlight-black.png", image: "/images/floodlight-black.png", price: 69.98, compareAt: 89.98 },
    ],
  },
  {
    slug: "duo-doorbell",
    category: "camera",
    title: "Wyze Duo Cam Doorbell",
    description: "Two cameras. Two views. Double the porch protection.",
    image: "/images/doorbell-black.png",
    alt: "Wyze Duo Cam Doorbell in matte black with dual stacked camera lenses and a circular doorbell button.",
    variants: [
      { label: "Black", swatch: "#111827", thumb: "/images/doorbell-black.png", image: "/images/doorbell-black.png", price: 69.98 },
    ],
  },
  {
    slug: "battery-cam-pro",
    category: "camera",
    title: "Wyze Battery Cam Pro",
    description: "Protect anywhere. See everything in 2.5K HDR. No power outlet or electrician needed.",
    image: "/images/battery-cam-white.png",
    alt: "Wyze Battery Cam Pro wireless outdoor security camera with compact rounded cube design and magnetic mounting base.",
    variants: [
      { label: "White", swatch: "#f4f4f5", thumb: "/images/battery-cam-white.png", image: "/images/battery-cam-white.png", price: 89.98 },
      { label: "Black", swatch: "#111827", thumb: "/images/battery-cam-black.png", image: "/images/battery-cam-black.png", price: 89.98 },
    ],
  },
  {
    slug: "motion-sensor",
    category: "sensor",
    title: "Wyze Sense Motion Sensor",
    description: "Detect motion across rooms and hallways.",
    image: "/images/motion-sensor.png",
    alt: "Wyze Sense Motion Sensor small white rectangular sensor with rounded edges for wall or shelf placement.",
    variants: [
      { label: "White", swatch: "#f4f4f5", price: 29.99 },
    ],
  },
  {
    slug: "contact-sensor",
    category: "sensor",
    title: "Wyze Sense Entry Sensor",
    description: "Know the moment a door or window opens.",
    image: "/images/contact-sensor.png",
    alt: "Wyze Sense Entry Sensor compact white contact sensor with two-piece design for doors and windows.",
    variants: [
      { label: "White", swatch: "#f4f4f5", price: 19.99 },
    ],
  },
  {
    slug: "sense-hub",
    category: "sensor",
    title: "Wyze Sense Hub (Required)",
    description: "Connects your sensors. Included free with any sensor.",
    image: "/images/hub.png",
    alt: "Wyze Sense Hub small white square connectivity hub with subtle status indicator on the front face.",
    required: true,
    freeWhenAnySensor: true,
    variants: [
      { label: "White", swatch: "#f4f4f5", price: 0, compareAt: 29.92 },
    ],
  },
  {
    slug: "microsd",
    category: "accessory",
    title: "Wyze MicroSD Card (256GB)",
    description: "Local storage for continuous recording.",
    image: "/images/microsd.png",
    alt: "Wyze MicroSD Card 256GB black memory card designed for local video storage in security cameras.",
    variants: [
      { label: "256GB", swatch: "#111827", price: 20.98 },
    ],
  },
  {
    slug: "keypad",
    category: "accessory",
    title: "Wyze Sense Keypad",
    description: "Arm and disarm from the door.",
    image: "/images/keypad.png",
    alt: "Wyze Sense Keypad slim white wireless keypad with numeric buttons for arming and disarming your system.",
    variants: [
      { label: "White", swatch: "#f4f4f5", price: 24.99 },
    ],
  },
];

// ─── Plan Seed Data ───────────────────────────────────────────────────────────

const planSeed = [
  {
    slug: "cam-unlimited",
    title: "Cam Unlimited",
    tagline: "Unlimited cameras. Full event history. AI detection.",
    price: 9.99,
    compareAt: 12.99,
  },
  {
    slug: "cam-plus",
    title: "Cam Plus",
    tagline: "Per-camera plan with person, pet, and package detection.",
    price: 2.99,
  },
  {
    slug: "no-plan",
    title: "No subscription",
    tagline: "Use basic features without a monthly plan.",
    price: 0,
  },
];

// ─── Execute Seed ─────────────────────────────────────────────────────────────

export async function seed() {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Plan.deleteMany({});
    logger.info("Cleared existing products and plans");

    // Insert products
    const products = await Product.insertMany(productSeed);
    logger.info(`Seeded ${products.length} products`);

    // Insert plans
    const plans = await Plan.insertMany(planSeed);
    logger.info(`Seeded ${plans.length} plans`);

    // Log summary
    const categoryCounts = products.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    logger.info({ categoryCounts, planCount: plans.length }, "Seed complete");
  } catch (error) {
    logger.error(error, "Seed failed");
    throw error;
  }
}

// If executed directly via `npm run seed`
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  connectDB().then(() => seed()).then(() => {
    disconnectDB();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
