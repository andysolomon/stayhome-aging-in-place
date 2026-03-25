"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { jsPDF } from "jspdf";

export const generatePdf = action({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    // Fetch all data
    const assessment = await ctx.runQuery(api.assessments.get, {
      assessmentId: args.assessmentId,
    });
    if (!assessment) throw new Error("Assessment not found");

    const property = await ctx.runQuery(api.properties.getPublic, {
      propertyId: assessment.propertyId,
    });
    if (!property) throw new Error("Property not found");

    const rooms = await ctx.runQuery(api.rooms.listByPropertyPublic, {
      propertyId: assessment.propertyId,
    });

    const hazards = await ctx.runQuery(api.assessmentHazards.listByAssessment, {
      assessmentId: args.assessmentId,
    });

    // Build PDF
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.text("StayHome Safety Report", 20, y);
    y += 12;

    // Property info
    doc.setFontSize(12);
    doc.text(`${property.address}`, 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`${property.city}, ${property.state} ${property.zip}`, 20, y);
    y += 7;
    doc.text(`Dwelling: ${property.dwellingType.replace("_", " ")}`, 20, y);
    y += 7;
    if (assessment.performedAt) {
      doc.text(
        `Assessment date: ${new Date(assessment.performedAt).toLocaleDateString()}`,
        20,
        y
      );
      y += 7;
    }
    y += 5;

    // Score
    doc.setFontSize(16);
    const score = assessment.overallScore ?? 0;
    const scoreLabel =
      score < 30 ? "Low Risk" : score < 60 ? "Moderate Risk" : "High Risk";
    doc.text(`Risk Score: ${score}/100 (${scoreLabel})`, 20, y);
    y += 15;

    // Per-room hazards
    doc.setFontSize(14);
    doc.text("Hazards by Room", 20, y);
    y += 10;

    for (const room of rooms) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const roomLabel =
        room.category === "custom"
          ? room.customName ?? "Custom Room"
          : room.category.replace("_", " ");

      doc.setFontSize(12);
      doc.text(roomLabel, 20, y);
      y += 7;

      const roomHazards = hazards.filter(
        (h) => h.roomId === room._id
      );

      if (roomHazards.length === 0) {
        doc.setFontSize(9);
        doc.text("  No hazards found", 25, y);
        y += 6;
      } else {
        for (const hazard of roomHazards) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(9);
          doc.text(
            `  [${hazard.severity.toUpperCase()}] ${hazard.hazardItemId.replace(/_/g, " ")}`,
            25,
            y
          );
          y += 5;
          if (hazard.note) {
            doc.text(`    Note: ${hazard.note.substring(0, 80)}`, 30, y);
            y += 5;
          }
        }
      }
      y += 5;
    }

    // Recommendations
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    y += 5;
    doc.setFontSize(14);
    doc.text("Prioritized Recommendations", 20, y);
    y += 10;

    const sorted = [...hazards].sort((a, b) => {
      const w: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return (w[b.severity] ?? 0) - (w[a.severity] ?? 0);
    });

    doc.setFontSize(9);
    for (const hazard of sorted.slice(0, 20)) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `[${hazard.severity.toUpperCase()}] ${hazard.hazardItemId.replace(/_/g, " ")}${hazard.note ? " - " + hazard.note.substring(0, 60) : ""}`,
        20,
        y
      );
      y += 5;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `StayHome Aging In Place - Page ${i} of ${pageCount}`,
        20,
        285
      );
    }

    // Save to Convex storage
    const pdfBytes = doc.output("arraybuffer");
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const storageId = await ctx.storage.store(blob);

    return storageId;
  },
});
