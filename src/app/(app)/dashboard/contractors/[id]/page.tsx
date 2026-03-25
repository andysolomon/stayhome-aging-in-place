"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContractorDetailPage() {
  const params = useParams();
  const contractorId = params.id as Id<"contractors">;
  const contractor = useQuery(api.contractors.get, { contractorId });

  if (contractor === undefined) return <div className="p-6 text-zinc-500">Loading...</div>;
  if (!contractor) return <div className="p-6 text-zinc-400">Contractor not found.</div>;

  return (
    <div className="text-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{contractor.businessName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400">Contact</p>
              <p className="text-sm">{contractor.contactEmail}</p>
              <p className="text-sm">{contractor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Service Areas</p>
              <p className="text-sm">{contractor.serviceAreaZips.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Specialties</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {contractor.hazardSpecialties.map((s) => (
                  <Badge key={s} variant="outline">{s.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </div>
            {contractor.bio && (
              <div>
                <p className="text-sm text-zinc-400">About</p>
                <p className="text-sm">{contractor.bio}</p>
              </div>
            )}
            {contractor.rating > 0 && (
              <p className="text-sm text-zinc-400">Rating: {contractor.rating}/5</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
