"use client";

import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useStoreUserEffect();
  return <>{children}</>;
}
