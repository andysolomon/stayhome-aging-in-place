"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const properties = useQuery(api.properties.listMine);
  const propertyCount = properties?.length ?? 0;

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-zinc-400">Properties</p>
              <p className="mt-1 text-2xl font-bold">{propertyCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-zinc-400">Assessments</p>
              <p className="mt-1 text-2xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-zinc-400">Plan</p>
              <p className="mt-1 text-lg font-semibold">Free</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/properties/new">
            <Button>Add Property</Button>
          </Link>
          <Button variant="outline" disabled>
            Start Assessment
          </Button>
          <Button variant="outline" disabled>
            View Reports
          </Button>
        </div>

        {/* Property list */}
        <h2 className="mt-10 text-lg font-semibold">My Properties</h2>

        <div className="mt-4 space-y-3">
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
