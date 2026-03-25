"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
});

const PRICE_IDS: Record<string, string> = {
  monitoring: process.env.STRIPE_MONITORING_PRICE_ID ?? "price_monitoring",
  premium: process.env.STRIPE_PREMIUM_PRICE_ID ?? "price_premium",
};

export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("monitoring"), v.literal("premium")),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user: Doc<"users"> | null = await ctx.runQuery(api.users.currentUser);
    if (!user) throw new Error("User not found");

    const sub: Doc<"subscriptions"> | null = await ctx.runQuery(
      api.subscriptions.getByUserId,
      { userId: user._id }
    );

    let customerId: string | undefined = sub?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: identity.email ?? undefined,
        name: identity.name ?? undefined,
        metadata: { convexUserId: user._id },
      });
      customerId = customer.id;

      await ctx.runMutation(api.subscriptions.create, {
        userId: user._id,
        stripeCustomerId: customerId,
        plan: "free",
        status: "active",
      });
    }

    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: PRICE_IDS[args.plan], quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/pricing`,
      });

    return session.url;
  },
});

export const createPortalSession = action({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user: Doc<"users"> | null = await ctx.runQuery(api.users.currentUser);
    if (!user) throw new Error("User not found");

    const sub: Doc<"subscriptions"> | null = await ctx.runQuery(
      api.subscriptions.getByUserId,
      { userId: user._id }
    );

    if (!sub?.stripeCustomerId) {
      throw new Error("No subscription found");
    }

    const session: Stripe.BillingPortal.Session =
      await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/pricing`,
      });

    return session.url;
  },
});
