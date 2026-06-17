import camV4White from "./assets/cam-v4-white.png";
import camV4Grey from "./assets/cam-v4-grey.png";
import camV4Black from "./assets/cam-v4-black.png";
import camPanV3White from "./assets/cam-pan-v3-white.png";
import camPanV3Black from "./assets/cam-pan-v3-black.png";
import floodlightWhite from "./assets/floodlight-white.png";
import floodlightBlack from "./assets/floodlight-black.png";
import doorbellBlack from "./assets/doorbell-black.png";
import batteryCamWhite from "./assets/battery-cam-white.png";
import batteryCamBlack from "./assets/battery-cam-black.png";
import motionSensor from "./assets/motion-sensor.png";
import hub from "./assets/hub.png";
import microsd from "./assets/microsd.png";
import contactSensor from "./assets/contact-sensor.png";
import keypad from "./assets/keypad.png";
import type { Plan, Product } from "./types";

export const products: Product[] = [
  {
    id: "cam-v4",
    step: "cameras",
    title: "Wyze Cam v4",
    description: "The clearest Wyze Cam ever made.",
    image: camV4White,
    alt: "Wyze Cam v4 indoor security camera with a compact spherical body and large round lens.",
    badge: "Save 22%",
    variants: [
      { id: "white", label: "White", swatch: "#f4f4f5", thumb: camV4White, image: camV4White, price: 27.98, compareAt: 35.98 },
      { id: "grey", label: "Grey", swatch: "#9ca3af", thumb: camV4Grey, image: camV4Grey, price: 27.98, compareAt: 35.98 },
      { id: "black", label: "Black", swatch: "#111827", thumb: camV4Black, image: camV4Black, price: 27.98, compareAt: 35.98 },
    ],
  },
  {
    id: "cam-pan-v3",
    step: "cameras",
    title: "Wyze Cam Pan v3",
    description: "360° pan and 180° tilt security camera.",
    image: camPanV3White,
    alt: "Wyze Cam Pan v3 pan-and-tilt security camera with rounded square body and rotating base.",
    badge: "Save 12%",
    variants: [
      { id: "white", label: "White", swatch: "#f4f4f5", thumb: camPanV3White, image: camPanV3White, price: 34.98, compareAt: 39.98 },
      { id: "black", label: "Black", swatch: "#111827", thumb: camPanV3Black, image: camPanV3Black, price: 34.98, compareAt: 39.98 },
    ],
  },
  {
    id: "floodlight",
    step: "cameras",
    title: "Wyze Cam Floodlight v2",
    description: "2K floodlight camera with a 160° wide-angle view for your garage.",
    image: floodlightWhite,
    alt: "Wyze Cam Floodlight v2 outdoor security camera mounted between two LED floodlight panels.",
    badge: "Save 22%",
    variants: [
      { id: "white", label: "White", swatch: "#f4f4f5", thumb: floodlightWhite, image: floodlightWhite, price: 69.98, compareAt: 89.98 },
      { id: "black", label: "Black", swatch: "#111827", thumb: floodlightBlack, image: floodlightBlack, price: 69.98, compareAt: 89.98 },
    ],
  },
  {
    id: "duo-doorbell",
    step: "cameras",
    title: "Wyze Duo Cam Doorbell",
    description: "Two cameras. Two views. Double the porch protection.",
    image: doorbellBlack,
    alt: "Wyze Duo Cam Doorbell in matte black with dual stacked camera lenses and a circular doorbell button.",
    variants: [{ id: "black", label: "Black", swatch: "#111827", thumb: doorbellBlack, image: doorbellBlack, price: 69.98 }],
  },
  {
    id: "battery-cam-pro",
    step: "cameras",
    title: "Wyze Battery Cam Pro",
    description:
      "Protect anywhere. See everything in 2.5K HDR. No power outlet or electrician needed.",
    image: batteryCamWhite,
    alt: "Wyze Battery Cam Pro wireless outdoor security camera with compact rounded cube design and magnetic mounting base.",
    variants: [
      { id: "white", label: "White", swatch: "#f4f4f5", thumb: batteryCamWhite, image: batteryCamWhite, price: 89.98 },
      { id: "black", label: "Black", swatch: "#111827", thumb: batteryCamBlack, image: batteryCamBlack, price: 89.98 },
    ],
  },
  // sensors
  {
    id: "motion-sensor",
    step: "sensors",
    title: "Wyze Sense Motion Sensor",
    description: "Detect motion across rooms and hallways.",
    image: motionSensor,
    alt: "Wyze Sense Motion Sensor small white rectangular sensor with rounded edges for wall or shelf placement.",
    variants: [{ id: "default", label: "White", swatch: "#f4f4f5", price: 29.99 }],
  },
  {
    id: "contact-sensor",
    step: "sensors",
    title: "Wyze Sense Entry Sensor",
    description: "Know the moment a door or window opens.",
    image: contactSensor,
    alt: "Wyze Sense Entry Sensor compact white contact sensor with two-piece design for doors and windows.",
    variants: [{ id: "default", label: "White", swatch: "#f4f4f5", price: 19.99 }],
  },
  {
    id: "sense-hub",
    step: "sensors",
    title: "Wyze Sense Hub (Required)",
    description: "Connects your sensors. Included free with any sensor.",
    image: hub,
    alt: "Wyze Sense Hub small white square connectivity hub with subtle status indicator on the front face.",
    required: true,
    freeWhenAnySensor: true,
    variants: [{ id: "default", label: "White", swatch: "#f4f4f5", price: 0, compareAt: 29.92 }],
  },
  // accessories
  {
    id: "microsd",
    step: "accessories",
    title: "Wyze MicroSD Card (256GB)",
    description: "Local storage for continuous recording.",
    image: microsd,
    alt: "Wyze MicroSD Card 256GB black memory card designed for local video storage in security cameras.",
    variants: [{ id: "256gb", label: "256GB", swatch: "#111827", price: 20.98 }],
  },
  {
    id: "keypad",
    step: "accessories",
    title: "Wyze Sense Keypad",
    description: "Arm and disarm from the door.",
    image: keypad,
    alt: "Wyze Sense Keypad slim white wireless keypad with numeric buttons for arming and disarming your system.",
    variants: [{ id: "default", label: "White", swatch: "#f4f4f5", price: 24.99 }],
  },
];

export const plans: Plan[] = [
  {
    id: "cam-unlimited",
    title: "Cam Unlimited",
    tagline: "Unlimited cameras. Full event history. AI detection.",
    price: 9.99,
    compareAt: 12.99,
  },
  {
    id: "cam-plus",
    title: "Cam Plus",
    tagline: "Per-camera plan with person, pet, and package detection.",
    price: 2.99,
  },
  {
    id: "no-plan",
    title: "No subscription",
    tagline: "Use basic features without a monthly plan.",
    price: 0,
  },
];

export const productsByStep = (step: Product["step"]) =>
  products.filter((p) => p.step === step);
