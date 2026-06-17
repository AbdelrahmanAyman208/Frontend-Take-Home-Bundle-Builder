import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { logger } from "../logger.js";

export interface ApiError {
  error: string;
  statusCode: number;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, err.message);

  // Known application error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    } satisfies ApiError);
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      statusCode: 400,
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    } satisfies ApiError);
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.entries(err.errors).map(([field, e]) => ({
      path: field,
      message: e.message,
    }));
    res.status(400).json({
      error: "Validation failed",
      statusCode: 400,
      details,
    } satisfies ApiError);
    return;
  }

  // Mongoose cast error (e.g. invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: `Invalid ${err.path}: ${err.value}`,
      statusCode: 400,
    } satisfies ApiError);
    return;
  }

  // Fallback
  res.status(500).json({
    error: "Internal server error",
    statusCode: 500,
  } satisfies ApiError);
}
