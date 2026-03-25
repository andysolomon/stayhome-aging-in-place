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
    plan: v.optional(v.union(v.literal("free"), v.literal("monitoring"), v.literal("premium"))),
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
    flaggedForReview: v.optional(v.boolean()),
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

  contractors: defineTable({
    businessName: v.string(),
    contactEmail: v.string(),
    phone: v.string(),
    serviceAreaZips: v.array(v.string()),
    hazardSpecialties: v.array(v.string()),
    verified: v.boolean(),
    active: v.boolean(),
    rating: v.number(),
    bio: v.optional(v.string()),
  }).index("by_verified_and_active", ["verified", "active"]),

  quote_requests: defineTable({
    assessmentId: v.id("assessments"),
    contractorId: v.id("contractors"),
    requesterId: v.id("users"),
    status: v.union(
      v.literal("requested"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    message: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_requesterId", ["requesterId"])
    .index("by_contractorId", ["contractorId"])
    .index("by_assessmentId", ["assessmentId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("monitoring"), v.literal("premium")),
    status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
    currentPeriodEnd: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  assessment_reminders: defineTable({
    propertyId: v.id("properties"),
    userId: v.id("users"),
    intervalMonths: v.number(),
    nextDueAt: v.number(),
  }).index("by_userId", ["userId"]),

  maintenance_checklists: defineTable({
    propertyId: v.id("properties"),
    userId: v.id("users"),
    month: v.string(),
    items: v.array(v.object({
      id: v.string(),
      label: v.string(),
      completed: v.boolean(),
    })),
  })
    .index("by_userId_and_month", ["userId", "month"])
    .index("by_propertyId", ["propertyId"]),

  partners: defineTable({
    name: v.string(),
    apiKeyHash: v.string(),
    contactEmail: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    rateLimit: v.number(),
  }).index("by_apiKeyHash", ["apiKeyHash"]),

  referrals: defineTable({
    partnerId: v.id("partners"),
    patientName: v.string(),
    patientEmail: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    reason: v.string(),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("assessed"), v.literal("closed")),
    propertyId: v.optional(v.id("properties")),
  })
    .index("by_partnerId", ["partnerId"])
    .index("by_status", ["status"]),
});
