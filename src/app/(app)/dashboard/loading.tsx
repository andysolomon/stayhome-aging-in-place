export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900" />
        ))}
      </div>
      <div className="mt-10 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
