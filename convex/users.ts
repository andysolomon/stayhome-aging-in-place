import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Store or update the current user in the users table.
 * Called from the client on first authenticated load (lazy sync).
 * Safe as a public mutation — it only writes the calling user's own record.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called store without authentication");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // Update profile fields if they changed in Clerk
      if (
        user.displayName !== (identity.name ?? "") ||
        user.email !== (identity.email ?? "") ||
        user.imageUrl !== identity.pictureUrl
      ) {
        await ctx.db.patch(user._id, {
          displayName: identity.name ?? "",
          email: identity.email ?? "",
          imageUrl: identity.pictureUrl,
        });
      }
      return user._id;
    }

    // Create new user with default "family" role and "free" plan
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      role: "family",
      plan: "free",
      displayName: identity.name ?? "",
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
    });
  },
});

/**
 * Get the current authenticated user's record.
 * Returns null if not authenticated or user not yet synced.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

/**
 * Get the current user's role. Returns null if not authenticated.
 */
export const getRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user?.role ?? null;
  },
});

/**
 * Set a user's role. Only callable by admins.
 */
export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("family"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify caller is admin
    const caller = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new Error("Only admins can change roles");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});
