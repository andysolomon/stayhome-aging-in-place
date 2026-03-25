import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

export const setReminder = mutation({
  args: {
    propertyId: v.id("properties"),
    intervalMonths: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const property = await ctx.db.get(args.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Property not found or access denied");
    }

    // Check for existing reminder
    const existing = await ctx.db
      .query("assessment_reminders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(50);

    const forProperty = existing.find((r) => r.propertyId === args.propertyId);

    const nextDueAt =
      Date.now() + args.intervalMonths * 30 * 24 * 60 * 60 * 1000;

    if (forProperty) {
      await ctx.db.patch(forProperty._id, {
        intervalMonths: args.intervalMonths,
        nextDueAt,
      });
      return forProperty._id;
    }

    return await ctx.db.insert("assessment_reminders", {
      propertyId: args.propertyId,
      userId: user._id,
      intervalMonths: args.intervalMonths,
      nextDueAt,
    });
  },
});

export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const reminders = await ctx.db
      .query("assessment_reminders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(20);

    return reminders;
  },
});
