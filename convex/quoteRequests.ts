import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";
import { canAccessFeature } from "./lib/entitlements";

export const requestQuote = mutation({
  args: {
    assessmentId: v.id("assessments"),
    contractorId: v.id("contractors"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Entitlement check
    if (!canAccessFeature(user, "contractor_matching")) {
      throw new Error("Upgrade your plan to request quotes");
    }

    // Verify assessment ownership
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new Error("Assessment not found");
    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    return await ctx.db.insert("quote_requests", {
      assessmentId: args.assessmentId,
      contractorId: args.contractorId,
      requesterId: user._id,
      status: "requested",
      message: args.message,
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("quote_requests")
      .withIndex("by_requesterId", (q) => q.eq("requesterId", user._id))
      .order("desc")
      .take(50);
  },
});

export const updateStatus = mutation({
  args: {
    quoteId: v.id("quote_requests"),
    status: v.union(
      v.literal("requested"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    const patch: Record<string, unknown> = { status: args.status };
    if (args.amount !== undefined) patch.amount = args.amount;
    await ctx.db.patch(args.quoteId, patch);
  },
});

export const listByContractor = query({
  args: { contractorId: v.id("contractors") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    return await ctx.db
      .query("quote_requests")
      .withIndex("by_contractorId", (q) => q.eq("contractorId", args.contractorId))
      .order("desc")
      .take(50);
  },
});
