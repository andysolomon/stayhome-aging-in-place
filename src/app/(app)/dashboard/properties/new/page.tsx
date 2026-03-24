"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AddressStep,
  type AddressData,
} from "@/components/onboarding/address-step";
import {
  RoomsStep,
  type RoomSelection,
} from "@/components/onboarding/rooms-step";

const STEPS = ["Address", "Rooms"];

export default function NewPropertyPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({
    address: "",
    city: "",
    state: "",
    zip: "",
    dwellingType: "",
  });
  const [rooms, setRooms] = useState<RoomSelection[]>([]);

  const createProperty = useMutation(api.properties.create);
  const addRoom = useMutation(api.rooms.add);
  const router = useRouter();

  function handleAddressNext(data: AddressData) {
    setAddressData(data);
    setStep(1);
  }

  async function handleFinish(selectedRooms: RoomSelection[]) {
    setRooms(selectedRooms);
    setIsSubmitting(true);

    try {
      const propertyId = await createProperty({
        address: addressData.address.trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        zip: addressData.zip.trim(),
        dwellingType: addressData.dwellingType as
          | "house"
          | "apartment"
          | "condo"
          | "townhouse"
          | "mobile_home"
          | "other",
      });

      for (const room of selectedRooms) {
        await addRoom({
          propertyId,
          category: room.category as
            | "bathroom"
            | "kitchen"
            | "bedroom"
            | "living_room"
            | "stairs_hallways"
            | "entrance_exit"
            | "exterior"
            | "custom",
          customName: room.customName,
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create property:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i <= step
                    ? "bg-white text-zinc-900"
                    : "border border-zinc-700 text-zinc-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i <= step ? "text-white" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-px w-8 bg-zinc-700" />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 0 ? "Property Address" : "Select Rooms"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <AddressStep data={addressData} onNext={handleAddressNext} />
            )}
            {step === 1 && (
              <RoomsStep
                initialRooms={rooms}
                onBack={() => setStep(0)}
                onFinish={handleFinish}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
