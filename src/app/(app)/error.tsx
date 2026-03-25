"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-white">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-400">
        An error occurred in this section. The sidebar is still available for
        navigation.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500"
      >
        Try Again
      </button>
    </div>
  );
}
