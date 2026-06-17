import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri:
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/bundle-magic",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
  },
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  ai: {
    openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
    openRouterModel: process.env.OPENROUTER_MODEL ?? "claude-3-opus-20240229",
    openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? "https://api.freemodel.dev/v1",
  },
} as const;
