import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <UserButton />
      </header>
      <div className="p-6">
        <p className="text-zinc-400">
          Welcome to StayHome. Your property safety dashboard will appear here.
        </p>
      </div>
    </main>
  );
}
