import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

export const create = mutation({
  args: {
    partnerId: v.id("partners"),
    patientName: v.string(),
    patientEmail: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    reason: v.string(),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("referrals", {
      ...args,
      status: "pending",
    });
  },
});

export const updateStatus = mutation({
  args: {
    referralId: v.id("referrals"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("assessed"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");
    await ctx.db.patch(args.referralId, { status: args.status });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");
    return await ctx.db.query("referrals").order("desc").take(100);
  },
});

export const listByPartner = query({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { referralId: v.id("referrals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.referralId);
  },
});
