"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HazardChecklist } from "@/components/assessment/hazard-checklist";
import { PhotoUpload } from "@/components/assessment/photo-upload";
import { AiResults } from "@/components/assessment/ai-results";
import { useState } from "react";
import { toast } from "sonner";

const ROOM_LABELS: Record<string, string> = {
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  living_room: "Living Room",
  stairs_hallways: "Stairs / Hallways",
  entrance_exit: "Entrance / Exit",
  exterior: "Exterior",
  custom: "Custom",
};

type DetectedHazard = {
  hazardItemId: string;
  severity: "low" | "medium" | "high";
  locationDescription: string;
  recommendation: string;
};

function AssessmentSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="mb-6 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as Id<"assessments">;

  const assessment = useQuery(api.assessments.get, { assessmentId });
  const property = useQuery(
    api.properties.get,
    assessment ? { propertyId: assessment.propertyId } : "skip"
  );
  const rooms = useQuery(
    api.rooms.listByProperty,
    assessment ? { propertyId: assessment.propertyId } : "skip"
  );
  const hazards = useQuery(api.assessmentHazards.listByAssessment, {
    assessmentId,
  });
  const completeAssessment = useMutation(api.assessments.complete);

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [aiHazards, setAiHazards] = useState<DetectedHazard[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [completing, setCompleting] = useState(false);

  if (assessment === undefined || property === undefined || rooms === undefined) {
    return <AssessmentSkeleton />;
  }

  if (!assessment || !property) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-zinc-400">Assessment not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (assessment.status === "complete") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8 text-white">
        <h1 className="text-2xl font-semibold">Assessment Complete</h1>
        <p className="mt-2 text-zinc-400">
          Risk score: <span className="font-bold">{assessment.overallScore}</span>/100
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => router.push(`/dashboard/assessments/${assessmentId}/report`)}>
            View Report
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/properties/${property._id}`)}>
            Back to Property
          </Button>
        </div>
      </div>
    );
  }

  const currentRoom = rooms?.[currentRoomIndex];
  const totalRooms = rooms?.length ?? 0;
  const isLastRoom = currentRoomIndex === totalRooms - 1;
  const totalHazards = hazards?.length ?? 0;

  async function handleComplete() {
    setCompleting(true);
    try {
      await completeAssessment({ assessmentId });
      toast.success("Assessment completed!");
      router.push(`/dashboard/assessments/${assessmentId}/report`);
    } catch {
      toast.error("Failed to complete assessment", {
        description: "Please try again.",
      });
      setCompleting(false);
    }
  }

  if (!currentRoom) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-zinc-400">No rooms to assess. Add rooms to the property first.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const completeButton = (
    <Button onClick={handleComplete} disabled={completing}>
      {completing ? "Completing..." : "Complete Assessment"}
    </Button>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{property.address}</h1>
        <p className="text-sm text-zinc-400">Safety Assessment</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Room {currentRoomIndex + 1} of {totalRooms}</span>
          <span>{Math.round(((currentRoomIndex + 1) / totalRooms) * 100)}% complete</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full bg-white transition-all duration-300"
            style={{ width: `${((currentRoomIndex + 1) / totalRooms) * 100}%` }}
          />
        </div>
      </div>

      {/* Current room */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {currentRoom.category === "custom"
              ? currentRoom.customName
              : ROOM_LABELS[currentRoom.category] ?? currentRoom.category}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo upload with AI */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">Photos</h3>
            <PhotoUpload
              assessmentId={assessmentId}
              roomId={currentRoom._id}
              onAiResults={(results) => {
                if (results.length > 0) {
                  setAiHazards(results);
                  setShowAiResults(true);
                }
              }}
            />
          </div>

          {/* AI Results */}
          {showAiResults && aiHazards.length > 0 && (
            <AiResults
              assessmentId={assessmentId}
              roomId={currentRoom._id}
              hazards={aiHazards}
              onDone={() => {
                setShowAiResults(false);
                setAiHazards([]);
              }}
            />
          )}

          {/* Manual checklist */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">
              Safety Checklist
            </h3>
            <HazardChecklist
              assessmentId={assessmentId}
              roomId={currentRoom._id}
              roomCategory={currentRoom.category}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentRoomIndex > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              setCurrentRoomIndex(currentRoomIndex - 1);
              setShowAiResults(false);
              setAiHazards([]);
            }}
          >
            Previous Room
          </Button>
        )}
        <div className="flex-1" />
        {!isLastRoom ? (
          <Button
            onClick={() => {
              setCurrentRoomIndex(currentRoomIndex + 1);
              setShowAiResults(false);
              setAiHazards([]);
            }}
          >
            Next Room
          </Button>
        ) : totalHazards === 0 ? (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button disabled={completing}>
                {completing ? "Completing..." : "Complete Assessment"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>No hazards recorded</AlertDialogTitle>
                <AlertDialogDescription>
                  You haven&apos;t flagged any hazards yet. Are you sure this assessment is complete?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Assessing</AlertDialogCancel>
                <AlertDialogAction onClick={handleComplete}>
                  Complete Anyway
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          completeButton
        )}
      </div>
    </div>
  );
}
