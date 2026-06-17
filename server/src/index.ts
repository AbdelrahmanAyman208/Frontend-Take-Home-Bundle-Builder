import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";

import { config } from "./config.js";
import { connectDB } from "./db.js";
import { logger } from "./logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { limiter } from "./middleware/rateLimiter.js";
import { swaggerSpec } from "./swagger.js";

// Routes
import productRoutes from "./routes/products.js";
import planRoutes from "./routes/plans.js";
import bundleRoutes from "./routes/bundles.js";
import checkoutRoutes from "./routes/checkout.js";
import aiRoutes from "./routes/ai.js";

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Structured request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => {
        // Don't log health checks and swagger assets
        const url = (req as express.Request).originalUrl ?? "";
        return url === "/health" || url.startsWith("/api-docs");
      },
    },
  }),
);

// ─── API Docs ─────────────────────────────────────────────────────────────────

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/products", productRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/bundles", bundleRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/ai", aiRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Not found", statusCode: 404 });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

async function start() {
  await connectDB();

  app.listen(config.port, () => {
    logger.info(`🚀 Bundle Magic API running on http://localhost:${config.port}`);
    logger.info(`📚 Swagger docs: http://localhost:${config.port}/api-docs`);
    logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
  });
}

start().catch((err) => {
  logger.error(err, "Failed to start server");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  process.exit(0);
});

// Export for testing
export { app };
