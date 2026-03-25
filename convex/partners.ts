import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

function hashApiKey(key: string): string {
  // Simple hash for MVP — in production use crypto.subtle.digest
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return "hash_" + Math.abs(hash).toString(36);
}

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "shk_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export const create = mutation({
  args: {
    name: v.string(),
    contactEmail: v.string(),
    rateLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);

    await ctx.db.insert("partners", {
      name: args.name,
      contactEmail: args.contactEmail,
      apiKeyHash,
      status: "active",
      rateLimit: args.rateLimit ?? 100,
    });

    // Return the plaintext key — shown ONCE to admin
    return apiKey;
  },
});

export const toggleStatus = mutation({
  args: { partnerId: v.id("partners") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");

    const partner = await ctx.db.get(args.partnerId);
    if (!partner) throw new Error("Partner not found");

    await ctx.db.patch(args.partnerId, {
      status: partner.status === "active" ? "inactive" : "active",
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("Admin access required");
    return await ctx.db.query("partners").take(50);
  },
});

export const validateApiKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const hash = hashApiKey(args.apiKey);
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_apiKeyHash", (q) => q.eq("apiKeyHash", hash))
      .unique();

    if (!partner || partner.status !== "active") return null;
    return partner;
  },
});
