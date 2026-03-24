"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { getHazardItemsForRoom, getHazardCategoriesForRoom } from "../../../convex/lib/hazardTaxonomy";

// Note: Convex API references use camelCase file names (assessmentHazards, not assessment-hazards)
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function HazardChecklist({
  assessmentId,
  roomId,
  roomCategory,
}: {
  assessmentId: Id<"assessments">;
  roomId: Id<"rooms">;
  roomCategory: string;
}) {
  const existingHazards = useQuery(api.assessmentHazards.listByRoom, {
    assessmentId,
    roomId,
  });
  const addHazard = useMutation(api.assessmentHazards.add);
  const removeHazard = useMutation(api.assessmentHazards.remove);
  const updateSeverity = useMutation(api.assessmentHazards.updateSeverity);

  const items = getHazardItemsForRoom(roomCategory);
  const categories = getHazardCategoriesForRoom(roomCategory);

  const [notes, setNotes] = useState<Record<string, string>>({});

  const foundHazardIds = new Set(
    existingHazards?.map((h) => h.hazardItemId) ?? []
  );

  function getExistingHazard(hazardItemId: string) {
    return existingHazards?.find((h) => h.hazardItemId === hazardItemId);
  }

  async function toggleHazard(hazardItemId: string, defaultSeverity: string) {
    const existing = getExistingHazard(hazardItemId);
    if (existing) {
      await removeHazard({ hazardId: existing._id });
    } else {
      await addHazard({
        assessmentId,
        roomId,
        hazardItemId,
        severity: defaultSeverity as "low" | "medium" | "high",
        note: notes[hazardItemId],
        source: "manual",
      });
    }
  }

  async function handleSeverityChange(
    hazardItemId: string,
    severity: string
  ) {
    const existing = getExistingHazard(hazardItemId);
    if (existing) {
      await updateSeverity({
        hazardId: existing._id,
        severity: severity as "low" | "medium" | "high",
      });
    }
  }

  if (existingHazards === undefined) {
    return <p className="text-zinc-500">Loading checklist...</p>;
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryItems = items.filter(
          (item) => item.categoryId === category.id
        );
        if (categoryItems.length === 0) return null;

        return (
          <div key={category.id}>
            <h3 className="text-sm font-semibold text-zinc-300">
              {category.name}
            </h3>
            <p className="mb-3 text-xs text-zinc-500">{category.description}</p>

            <div className="space-y-2">
              {categoryItems.map((item) => {
                const isFound = foundHazardIds.has(item.id);
                const existing = getExistingHazard(item.id);

                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      isFound
                        ? "border-red-800 bg-red-950/30"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isFound}
                        onCheckedChange={() =>
                          toggleHazard(item.id, item.defaultSeverity)
                        }
                      />
                      <div className="flex-1">
                        <Label className="text-sm font-medium cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-zinc-500">
                          {item.description}
                        </p>

                        {isFound && (
                          <div className="mt-2 flex gap-2">
                            <Select
                              value={existing?.severity ?? item.defaultSeverity}
                              onValueChange={(val: string | null) =>
                                val && handleSeverityChange(item.id, val)
                              }
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Add a note..."
                              className="h-8 text-xs"
                              value={notes[item.id] ?? ""}
                              onChange={(e) =>
                                setNotes({ ...notes, [item.id]: e.target.value })
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="rounded-lg border border-zinc-800 p-4">
        <p className="text-sm font-medium">
          Hazards found:{" "}
          <span className="text-red-400">
            {existingHazards.filter((h) => h.severity === "high").length} high
          </span>
          {", "}
          <span className="text-yellow-400">
            {existingHazards.filter((h) => h.severity === "medium").length}{" "}
            medium
          </span>
          {", "}
          <span className="text-green-400">
            {existingHazards.filter((h) => h.severity === "low").length} low
          </span>
        </p>
      </div>
    </div>
  );
}
