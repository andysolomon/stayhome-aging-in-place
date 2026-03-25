import { Doc } from "../_generated/dataModel";

type Feature = "contractor_matching" | "pdf_export" | "share_report" | "monitoring";

const FEATURE_REQUIREMENTS: Record<Feature, string[]> = {
  contractor_matching: ["monitoring", "premium"],
  pdf_export: ["premium"],
  share_report: ["premium"],
  monitoring: ["monitoring", "premium"],
};

export function canAccessFeature(user: Doc<"users">, feature: Feature): boolean {
  const plan = user.plan ?? "free";
  const required = FEATURE_REQUIREMENTS[feature];
  return required.includes(plan);
}
