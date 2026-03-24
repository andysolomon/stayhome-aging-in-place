"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export type AddressData = {
  address: string;
  city: string;
  state: string;
  zip: string;
  dwellingType: string;
};

const DWELLING_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "mobile_home", label: "Mobile Home" },
  { value: "other", label: "Other" },
];

export function AddressStep({
  data,
  onNext,
}: {
  data: AddressData;
  onNext: (data: AddressData) => void;
}) {
  const [form, setForm] = useState<AddressData>(data);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};

    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.zip.trim()) newErrors.zip = "ZIP code is required";
    else if (!/^\d{5}(-\d{4})?$/.test(form.zip.trim()))
      newErrors.zip = "Enter a valid ZIP code";
    if (!form.dwellingType) newErrors.dwellingType = "Select a dwelling type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validate()) {
      onNext(form);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          placeholder="123 Main St"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        {errors.address && (
          <p className="text-sm text-red-400">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Springfield"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          {errors.city && (
            <p className="text-sm text-red-400">{errors.city}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="IL"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          {errors.state && (
            <p className="text-sm text-red-400">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            placeholder="62704"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />
          {errors.zip && (
            <p className="text-sm text-red-400">{errors.zip}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Dwelling Type</Label>
          <Select
            value={form.dwellingType}
            onValueChange={(value: string | null) =>
              setForm({ ...form, dwellingType: value ?? "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {DWELLING_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dwellingType && (
            <p className="text-sm text-red-400">{errors.dwellingType}</p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleNext} className="w-full">
          Next
        </Button>
      </div>
    </div>
  );
}
