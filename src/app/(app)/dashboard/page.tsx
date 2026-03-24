"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const properties = useQuery(api.properties.listMine);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Properties</h2>
          <Link href="/dashboard/properties/new">
            <Button>Add Property</Button>
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {properties === undefined && (
            <p className="text-zinc-500">Loading...</p>
          )}

          {properties?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-400">
                  No properties yet. Add your first property to get started with
                  a safety assessment.
                </p>
                <Link href="/dashboard/properties/new">
                  <Button className="mt-4">Add Your First Property</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {properties?.map((property) => (
            <Link key={property._id} href={`/dashboard/properties/${property._id}`}>
              <Card className="cursor-pointer transition-colors hover:border-zinc-600">
                <CardHeader>
                  <CardTitle className="text-base">
                    {property.address}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">
                    {property.city}, {property.state} {property.zip}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 capitalize">
                    {property.dwellingType.replace("_", " ")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
