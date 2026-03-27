"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHazardItemById } from "../../../convex/lib/hazardTaxonomy";
import { useState } from "react";
import { toast } from "sonner";

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
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [accepted, setAccepted] = useState<Set<number>>(new Set());

  const visibleHazards = hazards.filter((_, i) => !dismissed.has(i) && !accepted.has(i));

  async function acceptHazard(hazard: DetectedHazard, index: number) {
    try {
      await addHazard({
        assessmentId,
        roomId,
        hazardItemId: hazard.hazardItemId,
        severity: hazard.severity,
        note: `${hazard.locationDescription}. ${hazard.recommendation}`,
        source: "ai",
        aiConfidence: 0.8,
      });
      setAccepted((prev) => new Set(prev).add(index));
      const item = getHazardItemById(hazard.hazardItemId);
      toast.success(`Added: ${item?.label ?? hazard.hazardItemId}`);
    } catch {
      toast.error("Failed to add hazard");
    }
  }

  async function acceptAll() {
    let count = 0;
    for (let i = 0; i < hazards.length; i++) {
      if (dismissed.has(i) || accepted.has(i)) continue;
      try {
        await addHazard({
          assessmentId,
          roomId,
          hazardItemId: hazards[i].hazardItemId,
          severity: hazards[i].severity,
          note: `${hazards[i].locationDescription}. ${hazards[i].recommendation}`,
          source: "ai",
          aiConfidence: 0.8,
        });
        count++;
      } catch {
        // continue with remaining
      }
    }
    toast.success(`Added ${count} hazard${count !== 1 ? "s" : ""} to checklist`);
    onDone();
  }

  function dismissHazard(index: number) {
    setDismissed((prev) => new Set(prev).add(index));
  }

  // Auto-dismiss when all hazards have been reviewed
  if (visibleHazards.length === 0 && (accepted.size > 0 || dismissed.size > 0)) {
    return (
      <div className="rounded-lg border border-zinc-800 p-4 text-center">
        <p className="text-sm text-zinc-400">
          All AI suggestions reviewed — {accepted.size} accepted, {dismissed.size} dismissed.
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onDone}>
          Continue
        </Button>
      </div>
    );
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
          AI Detected {visibleHazards.length} Hazard{visibleHazards.length !== 1 ? "s" : ""}
        </h4>
        {visibleHazards.length > 1 && (
          <Button size="sm" onClick={acceptAll}>
            Accept All
          </Button>
        )}
      </div>

      {hazards.map((hazard, i) => {
        if (dismissed.has(i) || accepted.has(i)) return null;
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
                onClick={() => acceptHazard(hazard, i)}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-zinc-500"
                onClick={() => dismissHazard(i)}
              >
                Dismiss
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
