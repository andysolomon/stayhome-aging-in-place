import { Doc } from "../_generated/dataModel";

const SEVERITY_WEIGHTS: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Calculate a risk score (0-100) from assessment hazards.
 * Higher score = more risk.
 */
export function calculateRiskScore(
  hazards: Doc<"assessment_hazards">[]
): number {
  if (hazards.length === 0) return 0;

  const totalWeight = hazards.reduce(
    (sum, h) => sum + (SEVERITY_WEIGHTS[h.severity] ?? 1),
    0
  );

  // Max possible: assume 30 high-severity hazards as ceiling
  const maxWeight = 30 * SEVERITY_WEIGHTS.high;
  const normalized = Math.min(100, Math.round((totalWeight / maxWeight) * 100));

  return normalized;
}

/**
 * Get color class for a risk score.
 */
export function getScoreColor(score: number): "green" | "amber" | "red" {
  if (score < 30) return "green";
  if (score < 60) return "amber";
  return "red";
}
