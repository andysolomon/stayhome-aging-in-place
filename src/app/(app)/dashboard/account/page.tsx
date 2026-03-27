"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  const user = useQuery(api.users.currentUser);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your profile and subscription
        </p>

        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium">
                  {user?.displayName ?? "Loading..."}
                </p>
                <p className="text-sm text-zinc-400">{user?.email}</p>
                <Badge variant="outline" className="mt-2 capitalize">
                  {user?.role ?? "..."}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
