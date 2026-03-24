"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PREDEFINED_ROOMS = [
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Bedroom" },
  { value: "living_room", label: "Living Room" },
  { value: "stairs_hallways", label: "Stairs / Hallways" },
  { value: "entrance_exit", label: "Entrance / Exit" },
  { value: "exterior", label: "Exterior" },
] as const;

export type RoomSelection = {
  category: string;
  customName?: string;
};

export function RoomsStep({
  initialRooms,
  onBack,
  onFinish,
  isSubmitting,
}: {
  initialRooms: RoomSelection[];
  onBack: () => void;
  onFinish: (rooms: RoomSelection[]) => void;
  isSubmitting: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialRooms.filter((r) => r.category !== "custom").map((r) => r.category))
  );
  const [customRooms, setCustomRooms] = useState<string[]>(
    initialRooms.filter((r) => r.category === "custom").map((r) => r.customName ?? "")
  );
  const [customInput, setCustomInput] = useState("");
  const [error, setError] = useState("");

  function toggleRoom(value: string) {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setSelected(next);
    setError("");
  }

  function addCustomRoom() {
    const name = customInput.trim();
    if (!name) return;
    if (customRooms.includes(name)) return;
    setCustomRooms([...customRooms, name]);
    setCustomInput("");
    setError("");
  }

  function removeCustomRoom(index: number) {
    setCustomRooms(customRooms.filter((_, i) => i !== index));
  }

  function handleFinish() {
    if (selected.size === 0 && customRooms.length === 0) {
      setError("Select at least one room");
      return;
    }

    const rooms: RoomSelection[] = [
      ...Array.from(selected).map((category) => ({ category })),
      ...customRooms.map((name) => ({
        category: "custom" as const,
        customName: name,
      })),
    ];

    onFinish(rooms);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Select the rooms in this property. You can also add custom rooms.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PREDEFINED_ROOMS.map((room) => (
          <label
            key={room.value}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3 cursor-pointer hover:border-zinc-600 transition-colors"
          >
            <Checkbox
              checked={selected.has(room.value)}
              onCheckedChange={() => toggleRoom(room.value)}
            />
            <span className="text-sm">{room.label}</span>
          </label>
        ))}
      </div>

      {customRooms.length > 0 && (
        <div className="space-y-2">
          <Label>Custom Rooms</Label>
          {customRooms.map((name, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"
            >
              <span className="text-sm">{name}</span>
              <button
                onClick={() => removeCustomRoom(i)}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Add a custom room..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomRoom()}
        />
        <Button variant="outline" onClick={addCustomRoom} type="button">
          Add
        </Button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : "Finish"}
        </Button>
      </div>
    </div>
  );
}
