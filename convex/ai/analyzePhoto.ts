"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export type DetectedHazard = {
  hazardItemId: string;
  severity: "low" | "medium" | "high";
  locationDescription: string;
  recommendation: string;
};

const SYSTEM_PROMPT = `You are a home safety inspector analyzing photos for hazards that could affect elderly residents aging in place.

Analyze the photo and identify safety hazards. For each hazard found, return a JSON object with:
- hazardItemId: one of the known hazard IDs listed below
- severity: "low", "medium", or "high"
- locationDescription: where in the image you see the hazard
- recommendation: a brief actionable fix

Known hazard IDs:
- loose_rugs, cluttered_pathways, uneven_flooring, missing_handrails, slippery_surfaces, exposed_cords
- no_smoke_detector, blocked_exits, overloaded_outlets, flammable_near_heat, no_fire_extinguisher
- narrow_doorways, high_thresholds, hard_to_reach_items, no_seated_option
- dim_lighting, no_nightlight, hard_to_reach_switches
- no_grab_bars, no_nonslip_mat, high_tub_entry, no_shower_seat, hot_water_risk
- stove_knob_access, no_auto_shutoff, heavy_items_high, sharp_objects_accessible
- uneven_walkway, poor_outdoor_lighting, no_outdoor_handrail, overgrown_vegetation, no_secure_entry

If the image is not of a room or home area, return an empty array.
If you detect a hazard not in the list, use the closest matching ID or "other" as the ID.

Return ONLY a JSON array, no markdown, no explanation. Example:
[{"hazardItemId":"loose_rugs","severity":"high","locationDescription":"Large unsecured rug in center of room","recommendation":"Add non-slip backing or remove the rug"}]`;

export const analyzePhoto = action({
  args: {
    photoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<DetectedHazard[]> => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get the photo URL from Convex storage
    const photoUrl = await ctx.storage.getUrl(args.photoStorageId);
    if (!photoUrl) {
      throw new Error("Photo not found in storage");
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: photoUrl, detail: "high" },
              },
              {
                type: "text",
                text: "Analyze this photo for home safety hazards. Return a JSON array of detected hazards.",
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content?.trim() ?? "[]";

      // Parse JSON, stripping any markdown code fences
      const cleaned = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const hazards: DetectedHazard[] = JSON.parse(cleaned);

      // Validate and sanitize
      return hazards
        .filter(
          (h) =>
            h.hazardItemId &&
            typeof h.hazardItemId === "string" &&
            ["low", "medium", "high"].includes(h.severity)
        )
        .map((h) => ({
          hazardItemId: h.hazardItemId,
          severity: h.severity as "low" | "medium" | "high",
          locationDescription: h.locationDescription ?? "",
          recommendation: h.recommendation ?? "",
        }));
    } catch (error) {
      console.error("AI analysis failed:", error);
      return [];
    }
  },
});
