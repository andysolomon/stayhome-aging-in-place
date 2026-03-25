"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminContractorsPage() {
  const contractors = useQuery(api.contractors.listAll);
  const toggleVerified = useMutation(api.contractors.toggleVerified);
  const toggleActive = useMutation(api.contractors.toggleActive);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Contractors</h1>
          <Link href="/admin/contractors/new">
            <Button>Add Contractor</Button>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {contractors === undefined && <p className="text-zinc-500">Loading...</p>}
          {contractors?.length === 0 && <p className="text-zinc-500">No contractors yet.</p>}

          {contractors?.map((c) => (
            <Card key={c._id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{c.businessName}</p>
                  <p className="text-xs text-zinc-500">{c.contactEmail} | {c.phone}</p>
                  <p className="text-xs text-zinc-500">
                    Zips: {c.serviceAreaZips.join(", ")} | Specialties: {c.hazardSpecialties.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={c.verified ? "bg-green-900 text-green-200" : "bg-zinc-800 text-zinc-400"}
                    onClick={() => toggleVerified({ contractorId: c._id })}
                    style={{ cursor: "pointer" }}
                  >
                    {c.verified ? "Verified" : "Unverified"}
                  </Badge>
                  <Badge
                    className={c.active ? "bg-blue-900 text-blue-200" : "bg-zinc-800 text-zinc-400"}
                    onClick={() => toggleActive({ contractorId: c._id })}
                    style={{ cursor: "pointer" }}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
