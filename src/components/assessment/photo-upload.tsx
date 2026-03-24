"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

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
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      const photoId = await savePhoto({
        assessmentId,
        roomId,
        storageId,
      });

      // Trigger AI analysis
      setAnalyzing(storageId);
      try {
        const hazards = await analyzePhoto({ photoStorageId: storageId });
        onAiResults?.(hazards);
      } catch (err) {
        console.error("AI analysis failed:", err);
      } finally {
        setAnalyzing(null);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
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

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-6 text-center transition-colors hover:border-zinc-500"
      >
        <p className="text-sm text-zinc-400">
          {uploading
            ? "Uploading..."
            : "Drag a photo here or click to upload"}
        </p>
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
          disabled={uploading}
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

      {/* Photo grid */}
      {photos && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo._id} className="group relative">
              {photo.url && (
                <img
                  src={photo.url}
                  alt="Room photo"
                  className="h-24 w-full rounded-lg object-cover"
                />
              )}
              <button
                onClick={() => removePhoto({ photoId: photo._id })}
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
