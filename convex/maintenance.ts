import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthenticatedUser } from "./lib/auth";

const MAINTENANCE_ITEMS: Record<string, Array<{ id: string; label: string }>> = {
  bathroom: [
    { id: "check_grab_bars", label: "Check grab bar tightness" },
    { id: "check_nonslip_mat", label: "Inspect non-slip bath mat condition" },
    { id: "test_water_temp", label: "Test water temperature (< 120°F)" },
  ],
  kitchen: [
    { id: "check_smoke_detector", label: "Test smoke detector" },
    { id: "check_fire_extinguisher", label: "Check fire extinguisher pressure" },
    { id: "check_stove_knobs", label: "Verify stove knob guards" },
  ],
  bedroom: [
    { id: "check_nightlight", label: "Check nightlight function" },
    { id: "check_smoke_detector_bed", label: "Test bedroom smoke detector" },
    { id: "clear_pathways", label: "Clear pathways to bathroom" },
  ],
  living_room: [
    { id: "check_rug_backing", label: "Check rug non-slip backing" },
    { id: "check_cords", label: "Secure loose electrical cords" },
  ],
  stairs_hallways: [
    { id: "check_handrails", label: "Test handrail stability" },
    { id: "check_stair_lighting", label: "Check stair lighting" },
    { id: "clear_stair_clutter", label: "Clear items from stairs" },
  ],
  entrance_exit: [
    { id: "check_door_locks", label: "Test door locks and deadbolts" },
    { id: "check_entry_lighting", label: "Check entry lighting" },
    { id: "check_threshold", label: "Inspect door threshold condition" },
  ],
  exterior: [
    { id: "check_walkway", label: "Inspect outdoor walkway for cracks" },
    { id: "check_outdoor_lighting", label: "Test outdoor lighting" },
    { id: "check_handrails_ext", label: "Check outdoor handrail stability" },
  ],
};

function getItemsForRoomTypes(roomCategories: string[]): Array<{ id: string; label: string }> {
  const seen = new Set<string>();
  const items: Array<{ id: string; label: string }> = [];

  for (const cat of roomCategories) {
    for (const item of MAINTENANCE_ITEMS[cat] ?? []) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      }
    }
  }
  return items;
}

export const generateForProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const property = await ctx.db.get(args.propertyId);
    if (!property || property.ownerId !== user._id) {
      throw new Error("Access denied");
    }

    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Check if already exists
    const existing = await ctx.db
      .query("maintenance_checklists")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .take(50);

    if (existing.find((c) => c.month === month)) {
      return null; // Already generated
    }

    // Get rooms for this property
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .take(50);

    const roomCategories = rooms.map((r) => r.category);
    const items = getItemsForRoomTypes(roomCategories);

    return await ctx.db.insert("maintenance_checklists", {
      propertyId: args.propertyId,
      userId: user._id,
      month,
      items: items.map((i) => ({ ...i, completed: false })),
    });
  },
});

export const toggleItem = mutation({
  args: {
    checklistId: v.id("maintenance_checklists"),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist || checklist.userId !== user._id) {
      throw new Error("Access denied");
    }

    const items = checklist.items.map((i) =>
      i.id === args.itemId ? { ...i, completed: !i.completed } : i
    );

    await ctx.db.patch(args.checklistId, { items });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const month = new Date().toISOString().slice(0, 7);

    return await ctx.db
      .query("maintenance_checklists")
      .withIndex("by_userId_and_month", (q) =>
        q.eq("userId", user._id).eq("month", month)
      )
      .take(20);
  },
});
