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

export default http;
