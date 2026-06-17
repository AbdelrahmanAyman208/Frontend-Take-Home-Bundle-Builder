import { Router, type Request, type Response, NextFunction } from "express";
import OpenAI from "openai";
import { config } from "../config.js";
import { Product } from "../models/Product.js";
import { Plan } from "../models/Plan.js";
import { AppError } from "../middleware/errorHandler.js";
import { logger } from "../logger.js";

const router = Router();

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: config.ai.openRouterApiKey,
  baseURL: config.ai.openRouterBaseUrl,
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      throw new AppError(400, "Answers object is required");
    }

    // Fetch catalog to inject into system prompt
    const products = await Product.find().lean();
    const plans = await Plan.find().lean();

    const catalogStr = `
PRODUCTS:
${products.map(p => `- ${p.title} (ID: ${p.slug}, Category: ${p.category})\n  Variants: ${(p.variants || []).map((v: any) => `${v.label} (VarID: ${v._id}, Price: $${v.price})`).join(", ")}`).join("\n")}

PLANS:
${plans.map(p => `- ${p.title} (ID: ${p.slug}, Price: $${p.price}) - Tagline: ${p.tagline || ''}`).join("\n")}
`;

    const systemPrompt = `You are the Bundle Magic AI Security Architect. You must analyze the customer's property details and recommend the perfect home security bundle from the provided catalog.

CATALOG:
${catalogStr}

CUSTOMER REQUIREMENTS:
- Property Type: ${answers.propertyType || 'Unknown'}
- Camera Coverage: ${answers.coverage || 'Unknown'}
- Entry Points (Doors/Windows): ${answers.entryPoints || 'Unknown'}
- Pets: ${answers.pets || 'Unknown'}
- Storage Preference: ${answers.storage || 'Unknown'}
- Monitoring: ${answers.monitoring || 'Unknown'}
- Budget: ${answers.budget || 'Unknown'}
- Extra Protection: ${answers.extraProtection || 'Unknown'}

INSTRUCTIONS:
1. Analyze the customer's requirements.
2. Select the optimal cameras based on coverage and property type.
3. Select the appropriate number of sensors based on entry points and pets.
4. Select the best plan based on storage and monitoring preferences.
5. You MUST output your recommendation as a strictly formatted JSON block. Do NOT include any conversational text before or after the JSON block.

JSON FORMAT:
\`\`\`json
{
  "bundle": {
    "items": [
      { "productId": "id_here", "variantId": "var_id_here", "quantity": 1 }
    ],
    "planId": "plan_id_here"
  },
  "explanation": "A professional, 2-3 sentence explanation of why you designed this specific bundle for their home."
}
\`\`\`
`;

    logger.info(`Sending analysis to AI model: ${config.ai.openRouterModel}`);

    const response = await openai.chat.completions.create({
      model: config.ai.openRouterModel,
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.2, // Low temperature for more deterministic/logical outputs
    });

    const aiMessage = response.choices[0]?.message?.content || "";
    
    // Extract JSON block
    let parsedRecommendation = null;
    const jsonMatch = aiMessage.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    
    if (jsonMatch) {
      try {
        parsedRecommendation = JSON.parse(jsonMatch[1]);
      } catch (e) {
        logger.error("Failed to parse AI JSON recommendation", e);
      }
    } else {
      try {
        const firstBrace = aiMessage.indexOf('{');
        const lastBrace = aiMessage.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          parsedRecommendation = JSON.parse(aiMessage.substring(firstBrace, lastBrace + 1));
        }
      } catch (e) {
         logger.error("Fallback JSON parsing failed", e);
      }
    }

    if (!parsedRecommendation) {
       console.error("Failed to parse recommendation from message:", aiMessage);
       throw new AppError(500, "AI failed to generate a valid recommendation format.");
    }

    // Enrich recommendation with human-readable product details
    const enrichedItems = (parsedRecommendation.bundle?.items || []).map((item: any) => {
      const product = products.find((p: any) => String(p.slug) === String(item.productId));
      const variant = product?.variants?.find((v: any) => String(v._id) === String(item.variantId));
      
      let frontendVariantId = "default";
      if (variant && variant.label) {
        const lowerLabel = variant.label.toLowerCase();
        if (lowerLabel === "white") frontendVariantId = product?.category === "sensor" ? "default" : "white";
        else if (lowerLabel === "black") frontendVariantId = "black";
        else if (lowerLabel === "grey") frontendVariantId = "grey";
        else if (lowerLabel === "256gb") frontendVariantId = "256gb";
      }

      return {
        ...item,
        productId: product?.slug || item.productId,
        variantId: frontendVariantId,
        name: product?.title || "Unknown Product",
        category: product?.category || "unknown",
        variantLabel: variant?.label || "Default",
        price: variant?.price ?? 0,
        image: product?.image || null,
      };
    });

    const plan = plans.find((p: any) => String(p.slug) === String(parsedRecommendation.bundle?.planId));

    const enrichedResponse = {
      ...parsedRecommendation,
      bundle: {
        ...parsedRecommendation.bundle,
        items: enrichedItems,
      },
      plan: plan ? {
        id: plan.slug,
        name: plan.title,
        price: plan.price,
        features: plan.tagline ? [plan.tagline] : [],
      } : null,
    };

    res.json(enrichedResponse);

  } catch (error) {
    console.error("🚨 RAW AI ERROR:", error);
    logger.error("AI Route Error", error);
    next(error);
  }
});

export default router;
