import { describe, it, expect } from "vitest";
import {
  getHazardItemsForRoom,
  getHazardCategoriesForRoom,
  getHazardItemById,
  HAZARD_ITEMS,
  HAZARD_CATEGORIES,
} from "../hazardTaxonomy";

describe("getHazardItemsForRoom", () => {
  it("returns items for bathroom", () => {
    const items = getHazardItemsForRoom("bathroom");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.applicableRoomTypes.includes("bathroom"))).toBe(true);
  });

  it("returns items for kitchen", () => {
    const items = getHazardItemsForRoom("kitchen");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.applicableRoomTypes.includes("kitchen"))).toBe(true);
  });

  it("returns empty for unknown room type", () => {
    const items = getHazardItemsForRoom("garage");
    expect(items.length).toBe(0);
  });

  it("each predefined room type has at least 3 items", () => {
    const roomTypes = ["bathroom", "kitchen", "bedroom", "living_room", "stairs_hallways", "entrance_exit", "exterior"];
    for (const room of roomTypes) {
      const items = getHazardItemsForRoom(room);
      expect(items.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("getHazardCategoriesForRoom", () => {
  it("returns categories for bathroom", () => {
    const cats = getHazardCategoriesForRoom("bathroom");
    expect(cats.length).toBeGreaterThan(0);
    expect(cats.some((c) => c.id === "bathroom_safety")).toBe(true);
  });

  it("returns categories for kitchen", () => {
    const cats = getHazardCategoriesForRoom("kitchen");
    expect(cats.some((c) => c.id === "kitchen_safety")).toBe(true);
  });
});

describe("getHazardItemById", () => {
  it("returns item for valid ID", () => {
    const item = getHazardItemById("no_grab_bars");
    expect(item).toBeDefined();
    expect(item?.label).toBe("Missing grab bars");
  });

  it("returns undefined for invalid ID", () => {
    expect(getHazardItemById("nonexistent")).toBeUndefined();
  });
});

describe("taxonomy integrity", () => {
  it("all items reference valid categories", () => {
    const categoryIds = new Set(HAZARD_CATEGORIES.map((c) => c.id));
    for (const item of HAZARD_ITEMS) {
      expect(categoryIds.has(item.categoryId)).toBe(true);
    }
  });

  it("all items have at least one applicable room type", () => {
    for (const item of HAZARD_ITEMS) {
      expect(item.applicableRoomTypes.length).toBeGreaterThan(0);
    }
  });
});
