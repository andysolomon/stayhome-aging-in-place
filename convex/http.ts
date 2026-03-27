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

// Stripe webhook signature verification using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  toleranceSec = 300
): Promise<boolean> {
  const parts = sigHeader.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signature = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!timestamp || !signature) return false;

  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (isNaN(age) || Math.abs(age) > toleranceSec) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedHex === signature;
}

// Stripe webhook
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.text();

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) {
        return new Response("Missing stripe-signature header", { status: 400 });
      }
      const valid = await verifyStripeSignature(body, sig, webhookSecret);
      if (!valid) {
        return new Response("Invalid signature", { status: 400 });
      }
    }

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
        await ctx.runMutation(api.subscriptions.updateFromStripe, {
          stripeCustomerId: session.customer,
          plan: "monitoring",
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

// Partner referral API
http.route({
  path: "/api/v1/referrals",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const partner = await ctx.runQuery(api.partners.validateApiKey, { apiKey });
    if (!partner) {
      return new Response(JSON.stringify({ error: "Invalid or inactive API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { patientName, patientEmail, address, city, state, zip, reason, urgency } = body;
    if (!patientName || !address || !city || !state || !zip || !reason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: patientName, address, city, state, zip, reason" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validUrgency = ["low", "medium", "high"].includes(urgency) ? urgency : "medium";

    const referralId = await ctx.runMutation(api.referrals.create, {
      partnerId: partner._id,
      patientName,
      patientEmail: patientEmail ?? undefined,
      address,
      city,
      state,
      zip,
      reason,
      urgency: validUrgency,
    });

    return new Response(
      JSON.stringify({ id: referralId, status: "pending" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
