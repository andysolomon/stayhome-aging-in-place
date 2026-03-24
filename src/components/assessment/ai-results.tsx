"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHazardItemById } from "../../../convex/lib/hazardTaxonomy";

type DetectedHazard = {
  hazardItemId: string;
  severity: "low" | "medium" | "high";
  locationDescription: string;
  recommendation: string;
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-900 text-red-200",
  medium: "bg-yellow-900 text-yellow-200",
  low: "bg-green-900 text-green-200",
};

export function AiResults({
  assessmentId,
  roomId,
  hazards,
  onDone,
}: {
  assessmentId: Id<"assessments">;
  roomId: Id<"rooms">;
  hazards: DetectedHazard[];
  onDone: () => void;
}) {
  const addHazard = useMutation(api.assessmentHazards.add);

  async function acceptHazard(hazard: DetectedHazard) {
    await addHazard({
      assessmentId,
      roomId,
      hazardItemId: hazard.hazardItemId,
      severity: hazard.severity,
      note: `${hazard.locationDescription}. ${hazard.recommendation}`,
      source: "ai",
      aiConfidence: 0.8,
    });
  }

  async function acceptAll() {
    for (const hazard of hazards) {
      await acceptHazard(hazard);
    }
    onDone();
  }

  if (hazards.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 p-4 text-center">
        <p className="text-sm text-zinc-400">No hazards detected in this photo.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onDone}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-300">
          AI Detected {hazards.length} Hazard{hazards.length !== 1 ? "s" : ""}
        </h4>
        <Button size="sm" onClick={acceptAll}>
          Accept All
        </Button>
      </div>

      {hazards.map((hazard, i) => {
        const item = getHazardItemById(hazard.hazardItemId);
        return (
          <div
            key={i}
            className="rounded-lg border border-zinc-800 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {item?.label ?? hazard.hazardItemId}
              </span>
              <Badge className={SEVERITY_COLORS[hazard.severity]}>
                {hazard.severity}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              {hazard.locationDescription}
            </p>
            <p className="text-xs text-zinc-500">
              Recommendation: {hazard.recommendation}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  acceptHazard(hazard);
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        );
      })}

      <Button variant="outline" className="w-full" onClick={onDone}>
        Done Reviewing
      </Button>
    </div>
  );
}
