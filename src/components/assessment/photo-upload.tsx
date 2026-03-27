"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";

export function PhotoUpload({
  assessmentId,
  roomId,
  onAiResults,
}: {
  assessmentId: Id<"assessments">;
  roomId: Id<"rooms">;
  onAiResults?: (results: Array<{
    hazardItemId: string;
    severity: "low" | "medium" | "high";
    locationDescription: string;
    recommendation: string;
  }>) => void;
}) {
  const generateUploadUrl = useMutation(api.assessmentPhotos.generateUploadUrl);
  const savePhoto = useMutation(api.assessmentPhotos.savePhoto);
  const removePhoto = useMutation(api.assessmentPhotos.remove);
  const analyzePhoto = useAction(api.ai.analyzePhoto.analyzePhoto);
  const photos = useQuery(api.assessmentPhotos.listByRoom, {
    assessmentId,
    roomId,
  });

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastPhotoStorageId, setLastPhotoStorageId] = useState<string | null>(null);
  const [aiError, setAiError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAiAnalysis = useCallback(async (storageId: string) => {
    setAnalyzing(true);
    setAiError(false);
    try {
      const hazards = await analyzePhoto({ photoStorageId: storageId as Id<"_storage"> });
      if (hazards.length > 0) {
        toast.success(`Found ${hazards.length} potential hazard${hazards.length !== 1 ? "s" : ""}`);
      } else {
        toast.info("No hazards detected in this photo");
      }
      onAiResults?.(hazards);
    } catch {
      setAiError(true);
      setLastPhotoStorageId(storageId);
      toast.error("AI analysis failed", {
        description: "You can retry or continue with the manual checklist.",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [analyzePhoto, onAiResults]);

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo must be under 10 MB");
      return;
    }

    setUploading(true);
    setAiError(false);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await savePhoto({
        assessmentId,
        roomId,
        storageId,
      });

      toast.success("Photo uploaded");
      setUploading(false);

      // Trigger AI analysis
      await runAiAnalysis(storageId);
    } catch {
      toast.error("Upload failed", {
        description: "Check your connection and try again.",
      });
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
      e.target.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  }

  async function handleRemove(photoId: Id<"assessment_photos">) {
    try {
      await removePhoto({ photoId });
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-6 text-center transition-colors hover:border-zinc-500"
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm text-zinc-400">Uploading photo...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-400">
              Drag a photo here or tap to upload
            </p>
            <p className="mt-1 text-xs text-zinc-600">JPG, PNG up to 10 MB</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || analyzing}
        >
          {uploading ? "Uploading..." : "Choose Photo"}
        </Button>
      </div>

      {/* AI analysis indicator */}
      {analyzing && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-800 bg-blue-950/30 p-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          <p className="text-sm text-blue-300">Analyzing photo for hazards...</p>
        </div>
      )}

      {/* AI retry on failure */}
      {aiError && !analyzing && lastPhotoStorageId && (
        <div className="flex items-center justify-between rounded-lg border border-amber-800 bg-amber-950/30 p-3">
          <p className="text-sm text-amber-300">AI analysis didn&apos;t complete</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAiAnalysis(lastPhotoStorageId)}
          >
            Retry Analysis
          </Button>
        </div>
      )}

      {/* Photo grid */}
      {photos && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo._id} className="group relative">
              {photo.url && (
                <Image
                  src={photo.url}
                  alt="Room photo"
                  width={200}
                  height={96}
                  className="h-24 w-full rounded-lg object-cover"
                  unoptimized
                />
              )}
              <button
                onClick={() => handleRemove(photo._id)}
                className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 py-0.5 text-xs text-red-400 group-hover:block"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
