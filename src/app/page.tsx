import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">StayHome</span>
        <Link
          href="/sign-in"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Sign In
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Keep your home safe for aging in place
        </h1>
        <p className="mt-4 max-w-lg text-lg text-zinc-400">
          AI-powered safety assessments, personalized recommendations, and
          vetted contractor matching — all in one platform.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-sm text-zinc-600">
        StayHome Aging In Place
      </footer>
    </div>
  );
}
