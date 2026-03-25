import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

// Admin mutations

export const create = mutation({
  args: {
    businessName: v.string(),
    contactEmail: v.string(),
    phone: v.string(),
    serviceAreaZips: v.array(v.string()),
    hazardSpecialties: v.array(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    return await ctx.db.insert("contractors", {
      ...args,
      verified: false,
      active: true,
      rating: 0,
    });
  },
});

export const update = mutation({
  args: {
    contractorId: v.id("contractors"),
    businessName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
    serviceAreaZips: v.optional(v.array(v.string())),
    hazardSpecialties: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    const { contractorId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(contractorId, patch);
    }
  },
});

export const toggleVerified = mutation({
  args: { contractorId: v.id("contractors") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    const c = await ctx.db.get(args.contractorId);
    if (!c) throw new Error("Contractor not found");
    await ctx.db.patch(args.contractorId, { verified: !c.verified });
  },
});

export const toggleActive = mutation({
  args: { contractorId: v.id("contractors") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    const c = await ctx.db.get(args.contractorId);
    if (!c) throw new Error("Contractor not found");
    await ctx.db.patch(args.contractorId, { active: !c.active });
  },
});

// Admin query
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");
    return await ctx.db.query("contractors").take(100);
  },
});

// Public queries

export const listVerified = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contractors")
      .withIndex("by_verified_and_active", (q) =>
        q.eq("verified", true).eq("active", true)
      )
      .take(50);
  },
});

export const get = query({
  args: { contractorId: v.id("contractors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contractorId);
  },
});

// Matching algorithm

export const getMatches = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) return [];

    const property = await ctx.db.get(assessment.propertyId);
    if (!property) return [];

    // Get unique hazard category IDs from assessment
    const hazards = await ctx.db
      .query("assessment_hazards")
      .withIndex("by_assessmentId", (q) => q.eq("assessmentId", args.assessmentId))
      .take(200);

    const hazardCategories = new Set(
      hazards.map((h) => {
        // Map hazardItemId to its category (e.g., "no_grab_bars" → "bathroom_safety")
        // For simplicity, use the first part before underscore or the full ID
        return h.hazardItemId;
      })
    );

    // Get verified + active contractors
    const contractors = await ctx.db
      .query("contractors")
      .withIndex("by_verified_and_active", (q) =>
        q.eq("verified", true).eq("active", true)
      )
      .take(50);

    // Filter and rank
    const matches = contractors
      .filter((c) => c.serviceAreaZips.includes(property.zip))
      .map((c) => {
        const overlapCount = c.hazardSpecialties.filter((s) =>
          hazardCategories.has(s)
        ).length;
        return { ...c, overlapCount };
      })
      .filter((c) => c.overlapCount > 0 || c.hazardSpecialties.length === 0)
      .sort((a, b) => {
        if (b.overlapCount !== a.overlapCount) return b.overlapCount - a.overlapCount;
        return b.rating - a.rating;
      });

    return matches;
  },
});
