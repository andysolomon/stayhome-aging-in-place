import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

export const add = mutation({
  args: {
    assessmentId: v.id("assessments"),
    roomId: v.id("rooms"),
    hazardItemId: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    note: v.optional(v.string()),
    source: v.union(v.literal("manual"), v.literal("ai")),
    aiConfidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    return await ctx.db.insert("assessment_hazards", {
      assessmentId: args.assessmentId,
      roomId: args.roomId,
      hazardItemId: args.hazardItemId,
      severity: args.severity,
      note: args.note,
      source: args.source,
      aiConfidence: args.aiConfidence,
    });
  },
});

export const remove = mutation({
  args: { hazardId: v.id("assessment_hazards") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const hazard = await ctx.db.get(args.hazardId);

    if (!hazard) throw new Error("Hazard not found");

    const assessment = await ctx.db.get(hazard.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.hazardId);
  },
});

export const updateSeverity = mutation({
  args: {
    hazardId: v.id("assessment_hazards"),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const hazard = await ctx.db.get(args.hazardId);

    if (!hazard) throw new Error("Hazard not found");

    const assessment = await ctx.db.get(hazard.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.hazardId, { severity: args.severity });
  },
});

export const listByAssessment = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessment_hazards")
      .withIndex("by_assessmentId", (q) => q.eq("assessmentId", args.assessmentId))
      .take(200);
  },
});

export const listByRoom = query({
  args: {
    assessmentId: v.id("assessments"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessment_hazards")
      .withIndex("by_assessmentId_and_roomId", (q) =>
        q.eq("assessmentId", args.assessmentId).eq("roomId", args.roomId)
      )
      .take(100);
  },
});
