import { UserButton } from "@clerk/nextjs";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
        <UserButton />
      </header>
      <div className="p-6">
        <p className="text-zinc-400">
          Admin dashboard. Manage users, contractors, and assessments.
        </p>
      </div>
    </main>
  );
}
