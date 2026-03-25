import { describe, it, expect } from "vitest";
import { canAccessFeature } from "../entitlements";
import { Id } from "../../_generated/dataModel";

function makeUser(plan?: "free" | "monitoring" | "premium") {
  return {
    _id: "test" as Id<"users">,
    _creationTime: 0,
    tokenIdentifier: "test",
    role: "family" as const,
    plan,
    displayName: "Test",
    email: "test@test.com",
  };
}

describe("canAccessFeature", () => {
  it("free user cannot access contractor_matching", () => {
    expect(canAccessFeature(makeUser("free"), "contractor_matching")).toBe(false);
  });

  it("monitoring user can access contractor_matching", () => {
    expect(canAccessFeature(makeUser("monitoring"), "contractor_matching")).toBe(true);
  });

  it("premium user can access contractor_matching", () => {
    expect(canAccessFeature(makeUser("premium"), "contractor_matching")).toBe(true);
  });

  it("free user cannot access pdf_export", () => {
    expect(canAccessFeature(makeUser("free"), "pdf_export")).toBe(false);
  });

  it("monitoring user cannot access pdf_export", () => {
    expect(canAccessFeature(makeUser("monitoring"), "pdf_export")).toBe(false);
  });

  it("premium user can access pdf_export", () => {
    expect(canAccessFeature(makeUser("premium"), "pdf_export")).toBe(true);
  });

  it("premium user can access share_report", () => {
    expect(canAccessFeature(makeUser("premium"), "share_report")).toBe(true);
  });

  it("user with no plan defaults to free", () => {
    expect(canAccessFeature(makeUser(undefined), "contractor_matching")).toBe(false);
  });
});
