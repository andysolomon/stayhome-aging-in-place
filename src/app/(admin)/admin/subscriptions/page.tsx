"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminSubscriptionsPage() {
  const subscriptions = useQuery(api.subscriptions.listAll);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Subscription Management</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {subscriptions?.length ?? 0} total subscriptions
        </p>

        <div className="mt-6 space-y-3">
          {subscriptions === undefined && <p className="text-zinc-500">Loading...</p>}
          {subscriptions?.length === 0 && <p className="text-zinc-500">No subscriptions yet.</p>}

          {subscriptions?.map((sub) => (
            <Card key={sub._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium capitalize">{sub.plan}</p>
                  <p className="text-xs text-zinc-500">
                    Customer: {sub.stripeCustomerId.slice(0, 20)}...
                  </p>
                  {sub.currentPeriodEnd && (
                    <p className="text-xs text-zinc-500">
                      Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge
                  className={
                    sub.status === "active"
                      ? "bg-green-900 text-green-200"
                      : sub.status === "past_due"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-red-900 text-red-200"
                  }
                >
                  {sub.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
