"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PropertiesPage() {
  const properties = useQuery(api.properties.listMine);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Properties</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your properties and start safety assessments
            </p>
          </div>
          <Link href="/dashboard/properties/new">
            <Button>Add Property</Button>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {properties === undefined && (
            <p className="text-zinc-500">Loading...</p>
          )}

          {properties?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-zinc-400">
                  No properties yet. Add your first property to get started
                  with a safety assessment.
                </p>
                <Link href="/dashboard/properties/new">
                  <Button className="mt-4">Add Your First Property</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {properties?.map((property) => (
            <Link
              key={property._id}
              href={`/dashboard/properties/${property._id}`}
            >
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
                  <Badge variant="outline" className="mt-2 text-xs capitalize">
                    {property.dwellingType.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
