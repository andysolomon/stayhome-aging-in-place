import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { calculateRiskScore } from "./lib/riskScoring";

export const create = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const property = await ctx.db.get(args.propertyId);

    if (!property || property.ownerId !== user._id) {
      throw new Error("Property not found or access denied");
    }

    return await ctx.db.insert("assessments", {
      propertyId: args.propertyId,
      status: "draft",
    });
  },
});

export const complete = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    // Calculate risk score
    const hazards = await ctx.db
      .query("assessment_hazards")
      .withIndex("by_assessmentId", (q) => q.eq("assessmentId", args.assessmentId))
      .take(500);

    const score = calculateRiskScore(hazards);

    await ctx.db.patch(args.assessmentId, {
      status: "complete",
      overallScore: score,
      performedAt: Date.now(),
    });

    return score;
  },
});

export const get = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) return null;

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) return null;

    return assessment;
  },
});

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const property = await ctx.db.get(args.propertyId);

    if (!property || property.ownerId !== user._id) return [];

    return await ctx.db
      .query("assessments")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .order("desc")
      .take(20);
  },
});

export const getByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    // Public query — no auth required
    const assessment = await ctx.db
      .query("assessments")
      .withIndex("by_shareToken", (q) => q.eq("shareToken", args.shareToken))
      .unique();

    if (!assessment || !assessment.shareToken) return null;

    return assessment;
  },
});

export const generateShareToken = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    const token = crypto.randomUUID();
    await ctx.db.patch(args.assessmentId, { shareToken: token });
    return token;
  },
});

export const revokeShareToken = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.assessmentId, { shareToken: undefined });
  },
});

// Admin queries

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("assessments").order("desc").take(100);
  },
});

export const toggleFlag = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    await ctx.db.patch(args.assessmentId, {
      flaggedForReview: !assessment.flaggedForReview,
    });
  },
});
