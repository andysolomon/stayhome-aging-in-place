export interface Property {
  id: string;
  ownerName: string;
  address: string;
  createdAt: string;
}

export interface Hazard {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  note?: string;
}

export interface Assessment {
  id: string;
  propertyId: string;
  performedAt: string;
  hazards: Hazard[];
}

export interface Contractor {
  id: string;
  name: string;
  serviceArea: string;
  verified: boolean;
}

export interface Subscription {
  id: string;
  plan: "free" | "monitoring" | "premium";
  status: "active" | "inactive" | "canceled";
}
