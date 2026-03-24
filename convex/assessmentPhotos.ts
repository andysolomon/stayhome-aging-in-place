import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const savePhoto = mutation({
  args: {
    assessmentId: v.id("assessments"),
    roomId: v.id("rooms"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const assessment = await ctx.db.get(args.assessmentId);

    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    return await ctx.db.insert("assessment_photos", {
      assessmentId: args.assessmentId,
      roomId: args.roomId,
      storageId: args.storageId,
    });
  },
});

export const listByRoom = query({
  args: {
    assessmentId: v.id("assessments"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("assessment_photos")
      .withIndex("by_assessmentId_and_roomId", (q) =>
        q.eq("assessmentId", args.assessmentId).eq("roomId", args.roomId)
      )
      .take(20);

    // Resolve storage URLs
    return await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId),
      }))
    );
  },
});

export const remove = mutation({
  args: { photoId: v.id("assessment_photos") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const photo = await ctx.db.get(args.photoId);

    if (!photo) throw new Error("Photo not found");

    const assessment = await ctx.db.get(photo.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.db.get(assessment.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    await ctx.storage.delete(photo.storageId);
    await ctx.db.delete(args.photoId);
  },
});
