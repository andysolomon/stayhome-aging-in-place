import { z } from "zod/v4";

export const addressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  dwellingType: z.enum(["house", "apartment", "condo", "townhouse", "mobile_home", "other"]),
});

export const roomSelectionSchema = z.object({
  category: z.enum([
    "bathroom", "kitchen", "bedroom", "living_room",
    "stairs_hallways", "entrance_exit", "exterior", "custom",
  ]),
  customName: z.string().optional(),
});

export const quoteRequestSchema = z.object({
  assessmentId: z.string().min(1),
  contractorId: z.string().min(1),
  message: z.string().max(500).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type RoomSelectionInput = z.infer<typeof roomSelectionSchema>;
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
