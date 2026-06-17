import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./config.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bundle Magic API",
      version: "1.0.0",
      description:
        "RESTful API for the Bundle Builder — manage products, plans, bundles, and mock checkout.",
      contact: {
        name: "Bundle Magic",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local development",
      },
    ],
    tags: [
      { name: "Products", description: "Product catalog endpoints" },
      { name: "Plans", description: "Subscription plan endpoints" },
      { name: "Bundles", description: "Bundle CRUD and persistence" },
      { name: "Checkout", description: "Mock checkout" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
