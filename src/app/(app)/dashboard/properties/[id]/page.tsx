"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as Id<"properties">;

  const property = useQuery(api.properties.get, { propertyId });
  const rooms = useQuery(api.rooms.listByProperty, { propertyId });
  const removeRoom = useMutation(api.rooms.remove);
  const removeProperty = useMutation(api.properties.remove);

  const [addingRoom, setAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const addRoom = useMutation(api.rooms.add);

  if (property === undefined) {
    return <div className="p-6 text-zinc-500">Loading...</div>;
  }

  if (property === null) {
    return <div className="p-6 text-zinc-400">Property not found.</div>;
  }

  async function handleAddRoom() {
    if (!newRoomName.trim()) return;
    await addRoom({
      propertyId,
      category: "custom",
      customName: newRoomName.trim(),
    });
    setNewRoomName("");
    setAddingRoom(false);
  }

  async function handleDeleteProperty() {
    await removeProperty({ propertyId });
    router.push("/dashboard");
  }

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{property.address}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {property.city}, {property.state} {property.zip}
            </p>
            <Badge variant="outline" className="mt-2 capitalize">
              {property.dwellingType.replace("_", " ")}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteProperty}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </Button>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rooms</h2>
            <Button size="sm" onClick={() => setAddingRoom(true)}>
              Add Room
            </Button>
          </div>

          {addingRoom && (
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Room name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
              />
              <Button onClick={handleAddRoom}>Add</Button>
              <Button variant="outline" onClick={() => setAddingRoom(false)}>
                Cancel
              </Button>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {rooms === undefined && (
              <p className="text-zinc-500">Loading rooms...</p>
            )}

            {rooms?.length === 0 && (
              <p className="text-zinc-400">No rooms added yet.</p>
            )}

            {rooms?.map((room) => (
              <Card key={room._id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {room.category === "custom"
                        ? room.customName
                        : ROOM_LABELS[room.category] ?? room.category}
                    </p>
                    {room.category === "custom" && (
                      <p className="text-xs text-zinc-500">Custom room</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeRoom({ roomId: room._id })}
                    className="text-xs text-zinc-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
