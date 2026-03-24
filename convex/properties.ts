import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { dwellingTypes } from "./schema";
import { getAuthenticatedUser } from "./lib/auth";

export const create = mutation({
  args: {
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    dwellingType: dwellingTypes,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("properties", {
      ownerId: user._id,
      address: args.address,
      city: args.city,
      state: args.state,
      zip: args.zip,
      dwellingType: args.dwellingType,
    });
  },
});

export const update = mutation({
  args: {
    propertyId: v.id("properties"),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    dwellingType: v.optional(dwellingTypes),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const property = await ctx.db.get(args.propertyId);

    if (!property || property.ownerId !== user._id) {
      throw new Error("Property not found or access denied");
    }

    const { propertyId, ...updates } = args;
    // Filter out undefined values
    const patch: Record<string, string> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(propertyId, patch);
    }
  },
});

export const remove = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const property = await ctx.db.get(args.propertyId);

    if (!property || property.ownerId !== user._id) {
      throw new Error("Property not found or access denied");
    }

    // Delete all rooms linked to this property
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .take(500);

    for (const room of rooms) {
      await ctx.db.delete(room._id);
    }

    await ctx.db.delete(args.propertyId);
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query("properties")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .take(50);
  },
});

export const get = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const property = await ctx.db.get(args.propertyId);

    if (!property || property.ownerId !== user._id) {
      return null;
    }

    return property;
  },
});
