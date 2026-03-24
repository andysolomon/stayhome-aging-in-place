import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-zinc-400">Page not found</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
