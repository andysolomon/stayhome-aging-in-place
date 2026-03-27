"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getHazardItemById } from "../../../../../../../convex/lib/hazardTaxonomy";
import { useState } from "react";
import { toast } from "sonner";

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

const SCORE_STYLES: Record<string, string> = {
  green: "bg-green-900 text-green-200",
  amber: "bg-yellow-900 text-yellow-200",
  red: "bg-red-900 text-red-200",
};

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-900 text-red-200",
  medium: "bg-yellow-900 text-yellow-200",
  low: "bg-green-900 text-green-200",
};

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-1 h-4 w-64" />
      <Skeleton className="mb-8 h-3 w-32" />
      <div className="mb-8 flex justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-6 w-56" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const assessmentId = params.id as Id<"assessments">;

  const assessment = useQuery(api.assessments.get, { assessmentId });
  const property = useQuery(
    api.properties.get,
    assessment ? { propertyId: assessment.propertyId } : "skip"
  );
  const rooms = useQuery(
    api.rooms.listByProperty,
    assessment ? { propertyId: assessment.propertyId } : "skip"
  );
  const hazards = useQuery(api.assessmentHazards.listByAssessment, {
    assessmentId,
  });

  const generatePdf = useAction(api.ai.generatePdf.generatePdf);
  const generateShareToken = useMutation(api.assessments.generateShareToken);
  const revokeShareToken = useMutation(api.assessments.revokeShareToken);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  if (!assessment || !property || !rooms || !hazards) {
    return <ReportSkeleton />;
  }

  const score = assessment.overallScore ?? 0;
  const scoreColor = score < 30 ? "green" : score < 60 ? "amber" : "red";
  const scoreLabel = score < 30 ? "Low Risk" : score < 60 ? "Moderate Risk" : "High Risk";

  const sortedHazards = [...hazards].sort((a, b) => {
    const w: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (w[b.severity] ?? 0) - (w[a.severity] ?? 0);
  });

  async function handleDownloadPdf() {
    setGeneratingPdf(true);
    try {
      const storageId = await generatePdf({ assessmentId });
      const url = `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site")}/getFile?storageId=${storageId}`;
      window.open(url, "_blank");
      toast.success("PDF generated");
    } catch {
      toast.error("PDF generation failed", {
        description: "Please try again in a moment.",
      });
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleShare() {
    try {
      const token = await generateShareToken({ assessmentId });
      const url = `${window.location.origin}/reports/${token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Failed to generate share link");
    }
  }

  async function handleRevokeShare() {
    try {
      await revokeShareToken({ assessmentId });
      setShareUrl(null);
      toast.success("Share link revoked");
    } catch {
      toast.error("Failed to revoke share link");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 text-white print:p-0 print:max-w-none">
      {/* Actions (hidden in print) */}
      <div className="mb-6 flex gap-3 print:hidden">
        <Button onClick={handleDownloadPdf} disabled={generatingPdf}>
          {generatingPdf ? "Generating..." : "Download PDF"}
        </Button>
        {assessment.shareToken ? (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="outline">Revoke Share Link</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke share link?</AlertDialogTitle>
                <AlertDialogDescription>
                  Anyone with the current link will lose access to this report. You can generate a new link later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeShare}>
                  Revoke
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button variant="outline" onClick={handleShare}>
            Share Report
          </Button>
        )}
      </div>

      {shareUrl && (
        <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900 p-3 print:hidden">
          <p className="text-xs text-zinc-400">Shareable link (copied to clipboard):</p>
          <p className="mt-1 text-sm font-mono text-zinc-300 break-all">{shareUrl}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Safety Report</h1>
        <p className="mt-1 text-zinc-400">
          {property.address}, {property.city}, {property.state} {property.zip}
        </p>
        {assessment.performedAt && (
          <p className="text-sm text-zinc-500">
            {new Date(assessment.performedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Score */}
      <div className="mb-8 text-center">
        <div
          className={`inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ${SCORE_STYLES[scoreColor]}`}
        >
          {score}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Risk Score (0–100) — {scoreLabel}
        </p>
      </div>

      {/* Per-room breakdown */}
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
                          <div>
                            <p className="font-medium">
                              {item?.label ?? h.hazardItemId.replace(/_/g, " ")}
                            </p>
                            {h.note && (
                              <p className="text-xs text-zinc-500">{h.note}</p>
                            )}
                          </div>
                          <Badge className={SEVERITY_BADGE[h.severity]}>
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

      {/* Prioritized Recommendations */}
      <h2 className="mb-4 mt-8 text-lg font-semibold">
        Prioritized Recommendations
      </h2>
      {sortedHazards.length === 0 ? (
        <p className="text-sm text-zinc-500">No hazards recorded — the home appears safe.</p>
      ) : (
        <div className="space-y-2">
          {sortedHazards.map((h, i) => {
            const item = getHazardItemById(h.hazardItemId);
            return (
              <div key={h._id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 text-zinc-500">{i + 1}.</span>
                <div>
                  <p className="font-medium">
                    {item?.label ?? h.hazardItemId.replace(/_/g, " ")}
                    <Badge className={`ml-2 ${SEVERITY_BADGE[h.severity]}`}>
                      {h.severity}
                    </Badge>
                  </p>
                  <p className="text-xs text-zinc-400">
                    {item?.description ?? ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
