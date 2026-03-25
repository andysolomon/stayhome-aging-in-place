"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function ContractorDirectoryPage() {
  const contractors = useQuery(api.contractors.listVerified);
  const [zipFilter, setZipFilter] = useState("");

  const filtered = contractors?.filter((c) =>
    zipFilter ? c.serviceAreaZips.includes(zipFilter.trim()) : true
  );

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Contractor Directory</h1>
        <p className="mt-1 text-sm text-zinc-400">Vetted contractors for home safety modifications</p>

        <div className="mt-4">
          <Input
            placeholder="Filter by ZIP code..."
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered === undefined && <p className="text-zinc-500">Loading...</p>}
          {filtered?.length === 0 && <p className="text-zinc-500 col-span-2">No contractors found.</p>}

          {filtered?.map((c) => (
            <Link key={c._id} href={`/dashboard/contractors/${c._id}`}>
              <Card className="h-full cursor-pointer transition-colors hover:border-zinc-600">
                <CardHeader>
                  <CardTitle className="text-base">{c.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-400">
                    Areas: {c.serviceAreaZips.slice(0, 5).join(", ")}
                    {c.serviceAreaZips.length > 5 && "..."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.hazardSpecialties.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                  {c.rating > 0 && (
                    <p className="mt-2 text-xs text-zinc-500">Rating: {c.rating}/5</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
