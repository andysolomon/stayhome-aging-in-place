"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/contractors", label: "Contractors" },
  { href: "/admin/assessments", label: "Assessments" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/partners", label: "Partners" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <Link href="/admin" className="text-lg font-semibold tracking-tight text-white">
          StayHome
        </Link>
        <Badge variant="outline" className="text-xs">
          Admin
        </Badge>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <UserButton />
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300">
            Back to App
          </Link>
        </div>
      </div>
    </aside>
  );
}
