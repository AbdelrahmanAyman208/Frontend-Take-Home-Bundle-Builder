import mongoose from "mongoose";
import { config } from "./config.js";
import { logger } from "./logger.js";

export async function connectDB(): Promise<typeof mongoose> {
  const conn = await mongoose.connect(config.mongodbUri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}`);
  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
