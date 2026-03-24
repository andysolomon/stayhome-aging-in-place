"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useStoreUserEffect();
  const role = useQuery(api.users.getRole);
  const router = useRouter();

  useEffect(() => {
    // role is undefined while loading, null if unauthenticated, or a string
    if (role !== undefined && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  // Show nothing while checking role
  if (role === undefined || role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
