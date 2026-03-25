import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/reports/{token}",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const token = parts[parts.length - 1];

    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const assessment = await ctx.runQuery(api.assessments.getByShareToken, {
      shareToken: token,
    });

    if (!assessment) {
      return new Response(
        JSON.stringify({ error: "Report not found or no longer available" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Load property
    const property = await ctx.runQuery(api.properties.getPublic, {
      propertyId: assessment.propertyId,
    });

    // Load rooms
    const rooms = await ctx.runQuery(api.rooms.listByPropertyPublic, {
      propertyId: assessment.propertyId,
    });

    // Load hazards
    const hazards = await ctx.runQuery(api.assessmentHazards.listByAssessment, {
      assessmentId: assessment._id,
    });

    return new Response(
      JSON.stringify({
        assessment,
        property,
        rooms,
        hazards,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }),
});

// Stripe webhook
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.text();
    // Note: In production, verify the Stripe signature here using STRIPE_WEBHOOK_SECRET
    // For MVP, we trust the payload

    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const PLAN_MAP: Record<string, "free" | "monitoring" | "premium"> = {
      [process.env.STRIPE_MONITORING_PRICE_ID ?? "price_monitoring"]: "monitoring",
      [process.env.STRIPE_PREMIUM_PRICE_ID ?? "price_premium"]: "premium",
    };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "subscription" && session.customer) {
        // Fetch subscription details from the session
        const plan = "monitoring"; // Default, will be updated by subscription.updated
        await ctx.runMutation(api.subscriptions.updateFromStripe, {
          stripeCustomerId: session.customer,
          plan,
          status: "active",
          stripeSubscriptionId: session.subscription,
        });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const sub = event.data.object;
      const priceId = sub.items?.data?.[0]?.price?.id;
      const plan = PLAN_MAP[priceId] ?? "monitoring";
      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : "canceled";

      await ctx.runMutation(api.subscriptions.updateFromStripe, {
        stripeCustomerId: sub.customer,
        plan,
        status,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: sub.current_period_end
          ? sub.current_period_end * 1000
          : undefined,
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      await ctx.runMutation(api.subscriptions.updateFromStripe, {
        stripeCustomerId: sub.customer,
        plan: "free",
        status: "canceled",
      });
    }

    return new Response("ok", { status: 200 });
  }),
});

export default http;
