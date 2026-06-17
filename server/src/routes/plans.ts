import { Router, type Request, type Response } from "express";
import { Plan } from "../models/Plan.js";

const router = Router();

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: List subscription plans
 *     description: Fetch all available subscription plans.
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Plans list
 */
router.get("/", async (_req: Request, res: Response) => {
  const plans = await Plan.find().lean();
  res.json({ data: plans });
});

export default router;
