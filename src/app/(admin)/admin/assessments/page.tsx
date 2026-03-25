"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminAssessmentsPage() {
  const assessments = useQuery(api.assessments.listAll);
  const toggleFlag = useMutation(api.assessments.toggleFlag);
  const router = useRouter();

  if (assessments === undefined) {
    return <div className="p-6 text-zinc-500">Loading assessments...</div>;
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Assessment Review Queue</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {assessments.length} total assessments
        </p>

        <div className="mt-6 space-y-3">
          {assessments.length === 0 && (
            <p className="text-zinc-500">No assessments yet.</p>
          )}

          {assessments.map((a) => {
            const score = a.overallScore ?? 0;
            const scoreColor =
              score < 30
                ? "bg-green-900 text-green-200"
                : score < 60
                  ? "bg-yellow-900 text-yellow-200"
                  : "bg-red-900 text-red-200";

            return (
              <Card key={a._id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/assessments/${a._id}/report`)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium capitalize">
                        {a.status}
                      </p>
                      {a.overallScore !== undefined && (
                        <Badge className={scoreColor}>
                          Score: {a.overallScore}
                        </Badge>
                      )}
                      {a.flaggedForReview && (
                        <Badge className="bg-orange-900 text-orange-200">
                          Flagged
                        </Badge>
                      )}
                    </div>
                    {a.performedAt && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(a.performedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFlag({ assessmentId: a._id })}
                  >
                    {a.flaggedForReview ? "Unflag" : "Flag"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
