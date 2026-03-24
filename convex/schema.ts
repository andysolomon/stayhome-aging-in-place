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

  assessments: defineTable({
    propertyId: v.id("properties"),
    status: v.union(v.literal("draft"), v.literal("complete")),
    overallScore: v.optional(v.number()),
    performedAt: v.optional(v.number()),
    shareToken: v.optional(v.string()),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_shareToken", ["shareToken"]),

  assessment_hazards: defineTable({
    assessmentId: v.id("assessments"),
    roomId: v.id("rooms"),
    hazardItemId: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    note: v.optional(v.string()),
    source: v.union(v.literal("manual"), v.literal("ai")),
    aiConfidence: v.optional(v.number()),
  })
    .index("by_assessmentId", ["assessmentId"])
    .index("by_assessmentId_and_roomId", ["assessmentId", "roomId"]),

  assessment_photos: defineTable({
    assessmentId: v.id("assessments"),
    roomId: v.id("rooms"),
    storageId: v.id("_storage"),
  })
    .index("by_assessmentId", ["assessmentId"])
    .index("by_assessmentId_and_roomId", ["assessmentId", "roomId"]),
});
