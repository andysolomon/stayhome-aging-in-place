"use client";

import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useStoreUserEffect();

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center border-b border-zinc-800 px-4 md:hidden">
          <MobileNav />
          <span className="ml-3 text-lg font-semibold tracking-tight text-white">
            StayHome
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
