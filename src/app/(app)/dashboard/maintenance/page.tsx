"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  const checklists = useQuery(api.maintenance.listMine);
  const properties = useQuery(api.properties.listMine);
  const generateChecklist = useMutation(api.maintenance.generateForProperty);
  const toggleItem = useMutation(api.maintenance.toggleItem);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Maintenance Checklists</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Monthly safety maintenance tasks for your properties
        </p>

        {/* Generate buttons */}
        {properties && properties.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {properties.map((p) => (
              <Button
                key={p._id}
                variant="outline"
                size="sm"
                onClick={() => generateChecklist({ propertyId: p._id })}
              >
                Generate for {p.address.split(",")[0]}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {checklists === undefined && (
            <p className="text-zinc-500">Loading...</p>
          )}
          {checklists?.length === 0 && (
            <p className="text-zinc-500">
              No checklists for this month. Click a button above to generate one.
            </p>
          )}

          {checklists?.map((checklist) => {
            const completed = checklist.items.filter((i) => i.completed).length;
            const total = checklist.items.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card key={checklist._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{checklist.month}</span>
                    <span className="text-sm text-zinc-400">
                      {completed}/{total} ({pct}%)
                    </span>
                  </CardTitle>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() =>
                            toggleItem({
                              checklistId: checklist._id,
                              itemId: item.id,
                            })
                          }
                        />
                        <span
                          className={`text-sm ${
                            item.completed
                              ? "text-zinc-500 line-through"
                              : "text-zinc-300"
                          }`}
                        >
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
