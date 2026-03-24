import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const dwellingTypes = v.union(
  v.literal("house"),
  v.literal("apartment"),
  v.literal("condo"),
  v.literal("townhouse"),
  v.literal("mobile_home"),
  v.literal("other")
);

export const roomCategories = v.union(
  v.literal("bathroom"),
  v.literal("kitchen"),
  v.literal("bedroom"),
  v.literal("living_room"),
  v.literal("stairs_hallways"),
  v.literal("entrance_exit"),
  v.literal("exterior"),
  v.literal("custom")
);

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    role: v.union(v.literal("family"), v.literal("admin")),
    displayName: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  properties: defineTable({
    ownerId: v.id("users"),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    dwellingType: dwellingTypes,
  }).index("by_ownerId", ["ownerId"]),

  rooms: defineTable({
    propertyId: v.id("properties"),
    category: roomCategories,
    customName: v.optional(v.string()),
    floorLevel: v.optional(v.number()),
  }).index("by_propertyId", ["propertyId"]),
});
