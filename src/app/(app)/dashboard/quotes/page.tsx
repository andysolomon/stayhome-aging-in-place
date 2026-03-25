"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-blue-900 text-blue-200",
  quoted: "bg-yellow-900 text-yellow-200",
  accepted: "bg-green-900 text-green-200",
  declined: "bg-red-900 text-red-200",
};

export default function QuotesPage() {
  const quotes = useQuery(api.quoteRequests.listMine);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">My Quotes</h1>
        <p className="mt-1 text-sm text-zinc-400">Track your contractor quote requests</p>

        <div className="mt-6 space-y-3">
          {quotes === undefined && <p className="text-zinc-500">Loading...</p>}
          {quotes?.length === 0 && (
            <p className="text-zinc-500">No quote requests yet. Start an assessment and request quotes from matched contractors.</p>
          )}

          {quotes?.map((q) => (
            <Card key={q._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium capitalize">{q.status}</p>
                  {q.message && <p className="text-xs text-zinc-500">{q.message}</p>}
                  {q.amount && <p className="text-xs text-zinc-400">Quote: ${q.amount}</p>}
                </div>
                <Badge className={STATUS_COLORS[q.status]}>{q.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
