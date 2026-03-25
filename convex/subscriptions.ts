import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

export const create = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    plan: v.union(v.literal("free"), v.literal("monitoring"), v.literal("premium")),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      plan: args.plan,
      status: args.status,
    });
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const updateFromStripe = mutation({
  args: {
    stripeCustomerId: v.string(),
    plan: v.union(v.literal("free"), v.literal("monitoring"), v.literal("premium")),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();

    if (!sub) return;

    await ctx.db.patch(sub._id, {
      plan: args.plan,
      status: args.status,
      stripeSubscriptionId: args.stripeSubscriptionId,
      currentPeriodEnd: args.currentPeriodEnd,
    });

    // Also update user.plan
    await ctx.db.patch(sub.userId, { plan: args.plan });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");
    return await ctx.db.query("subscriptions").take(100);
  },
});
