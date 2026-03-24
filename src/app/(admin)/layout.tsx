"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useStoreUserEffect();
  const role = useQuery(api.users.getRole);
  const router = useRouter();

  useEffect(() => {
    if (role !== undefined && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  if (role === undefined || role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
