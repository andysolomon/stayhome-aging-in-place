import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { roomCategories } from "./schema";
import { getAuthenticatedUser } from "./lib/auth";

async function verifyPropertyOwnership(
  ctx: { db: { get: (id: any) => Promise<any> } },
  user: { _id: any },
  propertyId: any
) {
  const property = await ctx.db.get(propertyId);
  if (!property || property.ownerId !== user._id) {
    throw new Error("Property not found or access denied");
  }
  return property;
}

export const add = mutation({
  args: {
    propertyId: v.id("properties"),
    category: roomCategories,
    customName: v.optional(v.string()),
    floorLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await verifyPropertyOwnership(ctx, user, args.propertyId);

    return await ctx.db.insert("rooms", {
      propertyId: args.propertyId,
      category: args.category,
      customName: args.customName,
      floorLevel: args.floorLevel,
    });
  },
});

export const update = mutation({
  args: {
    roomId: v.id("rooms"),
    category: v.optional(roomCategories),
    customName: v.optional(v.string()),
    floorLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const room = await ctx.db.get(args.roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    await verifyPropertyOwnership(ctx, user, room.propertyId);

    const { roomId, ...updates } = args;
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(roomId, patch);
    }
  },
});

export const remove = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const room = await ctx.db.get(args.roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    await verifyPropertyOwnership(ctx, user, room.propertyId);
    await ctx.db.delete(args.roomId);
  },
});

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await verifyPropertyOwnership(ctx, user, args.propertyId);

    return await ctx.db
      .query("rooms")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .take(50);
  },
});

/**
 * Public rooms query for shared reports (no auth).
 */
export const listByPropertyPublic = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .take(50);
  },
});
