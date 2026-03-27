"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AssessmentsPage() {
  const properties = useQuery(api.properties.listMine);
  const assessments = useQuery(api.assessments.listAll);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Assessments</h1>
        <p className="mt-1 text-sm text-zinc-400">
          View all safety assessments across your properties
        </p>

        <div className="mt-6 space-y-3">
          {assessments === undefined && (
            <p className="text-zinc-500">Loading...</p>
          )}

          {assessments?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-400">
                  No assessments yet. Add a property and start your first safety
                  assessment.
                </p>
                <Link href="/dashboard/properties/new">
                  <span className="mt-3 inline-block text-sm text-blue-400 hover:underline">
                    Add a property to get started
                  </span>
                </Link>
              </CardContent>
            </Card>
          )}

          {assessments?.map((a) => {
            const property = properties?.find((p) => p._id === a.propertyId);
            return (
              <Link
                key={a._id}
                href={
                  a.status === "complete"
                    ? `/dashboard/assessments/${a._id}/report`
                    : `/dashboard/assessments/${a._id}`
                }
              >
                <Card className="cursor-pointer transition-colors hover:border-zinc-600">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium">
                        {property?.address ?? "Property"}
                      </p>
                      <p className="text-xs text-zinc-400 capitalize">
                        {a.status}
                        {a.performedAt &&
                          ` — ${new Date(a.performedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    {a.overallScore !== undefined && (
                      <Badge
                        className={
                          a.overallScore < 30
                            ? "bg-green-900 text-green-200"
                            : a.overallScore < 60
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-red-900 text-red-200"
                        }
                      >
                        Score: {a.overallScore}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
