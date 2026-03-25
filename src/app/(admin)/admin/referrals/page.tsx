"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-900 text-blue-200",
  accepted: "bg-yellow-900 text-yellow-200",
  assessed: "bg-green-900 text-green-200",
  closed: "bg-zinc-800 text-zinc-400",
};

const URGENCY_COLORS: Record<string, string> = {
  high: "bg-red-900 text-red-200",
  medium: "bg-yellow-900 text-yellow-200",
  low: "bg-green-900 text-green-200",
};

export default function AdminReferralsPage() {
  const referrals = useQuery(api.referrals.listAll);
  const updateStatus = useMutation(api.referrals.updateStatus);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Referral Queue</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {referrals?.length ?? 0} total referrals
        </p>

        <div className="mt-6 space-y-3">
          {referrals?.length === 0 && <p className="text-zinc-500">No referrals yet.</p>}

          {referrals?.map((r) => (
            <Card key={r._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{r.patientName}</p>
                  <p className="text-xs text-zinc-500">
                    {r.address}, {r.city}, {r.state} {r.zip}
                  </p>
                  <p className="text-xs text-zinc-500">{r.reason}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge className={URGENCY_COLORS[r.urgency]}>{r.urgency}</Badge>
                    <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                  </div>
                </div>
                <Select
                  value={r.status}
                  onValueChange={(val: string | null) => {
                    if (val) {
                      updateStatus({
                        referralId: r._id,
                        status: val as "pending" | "accepted" | "assessed" | "closed",
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="assessed">Assessed</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
