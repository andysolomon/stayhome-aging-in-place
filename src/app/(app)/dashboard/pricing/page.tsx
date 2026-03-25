"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const TIERS = [
  {
    name: "Free",
    plan: "free" as const,
    price: "$0/mo",
    features: ["Safety assessments", "Basic risk score", "Manual checklist"],
  },
  {
    name: "Monitoring",
    plan: "monitoring" as const,
    price: "$9/mo",
    features: [
      "Everything in Free",
      "Re-assessment reminders",
      "Maintenance checklists",
      "Contractor matching",
      "Safety timeline",
    ],
  },
  {
    name: "Premium",
    plan: "premium" as const,
    price: "$29/mo",
    features: [
      "Everything in Monitoring",
      "PDF report downloads",
      "Shareable report links",
      "Priority contractor matching",
    ],
  },
];

export default function PricingPage() {
  const subscription = useQuery(api.subscriptions.getMine);
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const createPortal = useAction(api.stripe.createPortalSession);
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = subscription?.plan ?? "free";

  async function handleUpgrade(plan: "monitoring" | "premium") {
    setLoading(plan);
    try {
      const url = await createCheckout({ plan });
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("manage");
    try {
      const url = await createPortal();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Portal failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-center">Choose Your Plan</h1>
        <p className="mt-2 text-center text-zinc-400">
          Upgrade to unlock contractor matching, PDF reports, and monitoring features.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TIERS.map((tier) => {
            const isCurrent = currentPlan === tier.plan;
            return (
              <Card
                key={tier.plan}
                className={isCurrent ? "border-white" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name}
                    {isCurrent && <Badge>Current</Badge>}
                  </CardTitle>
                  <p className="text-2xl font-bold">{tier.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                        <span className="text-green-400">+</span> {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrent ? (
                      currentPlan !== "free" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManage}
                          disabled={loading === "manage"}
                        >
                          Manage Subscription
                        </Button>
                      ) : null
                    ) : tier.plan !== "free" ? (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(tier.plan)}
                        disabled={loading === tier.plan}
                      >
                        {loading === tier.plan ? "Loading..." : "Upgrade"}
                      </Button>
                    ) : null}
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
