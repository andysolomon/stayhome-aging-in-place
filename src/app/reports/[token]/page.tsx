"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHazardItemById } from "../../../../convex/lib/hazardTaxonomy";

const ROOM_LABELS: Record<string, string> = {
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  living_room: "Living Room",
  stairs_hallways: "Stairs / Hallways",
  entrance_exit: "Entrance / Exit",
  exterior: "Exterior",
  custom: "Custom",
};

export default function SharedReportPage() {
  const params = useParams();
  const token = params.token as string;

  const assessment = useQuery(api.assessments.getByShareToken, {
    shareToken: token,
  });

  const property = useQuery(
    api.properties.getPublic,
    assessment ? { propertyId: assessment.propertyId } : "skip"
  );
  const rooms = useQuery(
    api.rooms.listByPropertyPublic,
    assessment ? { propertyId: assessment.propertyId } : "skip"
  );
  const hazards = useQuery(
    api.assessmentHazards.listByAssessment,
    assessment ? { assessmentId: assessment._id } : "skip"
  );

  if (assessment === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Loading report...
      </div>
    );
  }

  if (assessment === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-xl font-semibold">Report Not Available</h1>
        <p className="mt-2 text-zinc-400">
          This report link is no longer valid or has been revoked.
        </p>
      </div>
    );
  }

  if (!property || !rooms || !hazards) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Loading report data...
      </div>
    );
  }

  const score = assessment.overallScore ?? 0;
  const scoreColor =
    score < 30
      ? "bg-green-900 text-green-200"
      : score < 60
        ? "bg-yellow-900 text-yellow-200"
        : "bg-red-900 text-red-200";

  const sortedHazards = [...hazards].sort((a, b) => {
    const w: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (w[b.severity] ?? 0) - (w[a.severity] ?? 0);
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">StayHome</span>
        <span className="ml-2 text-sm text-zinc-500">Shared Safety Report</span>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold">Safety Report</h1>
        <p className="mt-1 text-zinc-400">
          {property.address}, {property.city}, {property.state} {property.zip}
        </p>
        {assessment.performedAt && (
          <p className="text-sm text-zinc-500">
            {new Date(assessment.performedAt).toLocaleDateString()}
          </p>
        )}

        {/* Score */}
        <div className="my-8 text-center">
          <div
            className={`inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ${scoreColor}`}
          >
            {score}
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Risk Score —{" "}
            {score < 30
              ? "Low Risk"
              : score < 60
                ? "Moderate Risk"
                : "High Risk"}
          </p>
        </div>

        {/* Rooms */}
        <h2 className="mb-4 text-lg font-semibold">Room-by-Room Breakdown</h2>
        <div className="space-y-4">
          {rooms.map((room) => {
            const roomHazards = hazards.filter((h) => h.roomId === room._id);
            const roomLabel =
              room.category === "custom"
                ? room.customName
                : ROOM_LABELS[room.category] ?? room.category;

            return (
              <Card key={room._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{roomLabel}</span>
                    <span className="text-sm text-zinc-400">
                      {roomHazards.length} hazard{roomHazards.length !== 1 ? "s" : ""}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roomHazards.length === 0 ? (
                    <p className="text-sm text-zinc-500">No hazards detected.</p>
                  ) : (
                    <div className="space-y-2">
                      {roomHazards.map((h) => {
                        const item = getHazardItemById(h.hazardItemId);
                        return (
                          <div
                            key={h._id}
                            className="flex items-start justify-between text-sm"
                          >
                            <p className="font-medium">
                              {item?.label ?? h.hazardItemId.replace(/_/g, " ")}
                            </p>
                            <Badge
                              className={
                                h.severity === "high"
                                  ? "bg-red-900 text-red-200"
                                  : h.severity === "medium"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : "bg-green-900 text-green-200"
                              }
                            >
                              {h.severity}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        <h2 className="mb-4 mt-8 text-lg font-semibold">Recommendations</h2>
        <div className="space-y-2">
          {sortedHazards.map((h, i) => {
            const item = getHazardItemById(h.hazardItemId);
            return (
              <div key={h._id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 text-zinc-500">{i + 1}.</span>
                <div>
                  <p className="font-medium">
                    {item?.label ?? h.hazardItemId.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-zinc-400">{item?.description ?? ""}</p>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-12 border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
          Generated by StayHome Aging In Place
        </footer>
      </div>
    </div>
  );
}
