import { describe, it, expect } from "vitest";
import { calculateRiskScore, getScoreColor } from "../riskScoring";
import { Id } from "../../_generated/dataModel";

function makeHazard(severity: "low" | "medium" | "high") {
  return {
    _id: "test" as Id<"assessment_hazards">,
    _creationTime: 0,
    assessmentId: "test" as Id<"assessments">,
    roomId: "test" as Id<"rooms">,
    hazardItemId: "test",
    severity,
    source: "manual" as const,
  };
}

describe("calculateRiskScore", () => {
  it("returns 0 for empty hazards", () => {
    expect(calculateRiskScore([])).toBe(0);
  });

  it("calculates score for single high-severity hazard", () => {
    const score = calculateRiskScore([makeHazard("high")]);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("calculates score for single low-severity hazard", () => {
    const low = calculateRiskScore([makeHazard("low")]);
    const high = calculateRiskScore([makeHazard("high")]);
    expect(low).toBeLessThan(high);
  });

  it("weights high > medium > low", () => {
    const low = calculateRiskScore([makeHazard("low")]);
    const med = calculateRiskScore([makeHazard("medium")]);
    const high = calculateRiskScore([makeHazard("high")]);
    expect(low).toBeLessThan(med);
    expect(med).toBeLessThan(high);
  });

  it("caps at 100", () => {
    const many = Array(50).fill(null).map(() => makeHazard("high"));
    expect(calculateRiskScore(many)).toBe(100);
  });

  it("handles mixed severities", () => {
    const mixed = [makeHazard("high"), makeHazard("medium"), makeHazard("low")];
    const score = calculateRiskScore(mixed);
    // high=3 + medium=2 + low=1 = 6, max=90, normalized = round(6/90*100) = 7
    expect(score).toBe(7);
  });
});

describe("getScoreColor", () => {
  it("returns green for scores below 30", () => {
    expect(getScoreColor(0)).toBe("green");
    expect(getScoreColor(29)).toBe("green");
  });

  it("returns amber for scores 30-59", () => {
    expect(getScoreColor(30)).toBe("amber");
    expect(getScoreColor(59)).toBe("amber");
  });

  it("returns red for scores 60+", () => {
    expect(getScoreColor(60)).toBe("red");
    expect(getScoreColor(100)).toBe("red");
  });
});
