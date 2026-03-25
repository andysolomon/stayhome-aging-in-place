"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  const assessments = useQuery(api.assessments.listAll);
  const subscriptions = useQuery(api.subscriptions.listAll);
  const referrals = useQuery(api.referrals.listAll);
  const contractors = useQuery(api.contractors.listAll);

  const totalAssessments = assessments?.length ?? 0;
  const completedAssessments = assessments?.filter((a) => a.status === "complete") ?? [];
  const avgScore =
    completedAssessments.length > 0
      ? Math.round(
          completedAssessments.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) /
            completedAssessments.length
        )
      : 0;

  const activeSubs = subscriptions?.filter((s) => s.status === "active") ?? [];
  const monitoringCount = activeSubs.filter((s) => s.plan === "monitoring").length;
  const premiumCount = activeSubs.filter((s) => s.plan === "premium").length;

  const totalReferrals = referrals?.length ?? 0;
  const assessedReferrals = referrals?.filter((r) => r.status === "assessed").length ?? 0;

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Analytics</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm text-zinc-400">Total Assessments</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{totalAssessments}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-zinc-400">Average Risk Score</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{avgScore}/100</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-zinc-400">Total Contractors</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{contractors?.length ?? 0}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-zinc-400">Monitoring Subscribers</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{monitoringCount}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-zinc-400">Premium Subscribers</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{premiumCount}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-zinc-400">Partner Referrals</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalReferrals}</p>
              <p className="text-xs text-zinc-500">{assessedReferrals} assessed ({totalReferrals > 0 ? Math.round((assessedReferrals / totalReferrals) * 100) : 0}%)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
