import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  {
    title: "AI-Powered Safety Audit",
    description:
      "Snap a photo of any room. Our AI detects fall risks, fire hazards, and accessibility gaps in seconds — no inspector visit required.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
      </svg>
    ),
  },
  {
    title: "30-Point Safety Checklist",
    description:
      "Covers fall hazards, fire safety, accessibility, lighting, bathroom, kitchen, and exterior risks. Room-by-room, nothing gets missed.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Risk Score & Report",
    description:
      "Get a clear 0-100 safety score with prioritized recommendations. Share the report with family, caregivers, or contractors — no login needed.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "Vetted Contractor Matching",
    description:
      "Matched by ZIP code and hazard specialty. Get quotes from local pros who know exactly what your home needs — no cold-calling.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
      </svg>
    ),
  },
];

const STEPS = [
  { step: "1", title: "Add your property", description: "Enter your address and select which rooms to assess." },
  { step: "2", title: "Run the assessment", description: "Use the checklist, upload photos, or both. AI catches what eyes miss." },
  { step: "3", title: "Get your score and plan", description: "See prioritized fixes, share the report, and connect with contractors." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Image src="/logo.svg" alt="StayHome" width={160} height={32} priority />
        <Link
          href="/sign-in"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-20 pt-24 text-center sm:pt-32">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          Home safety for the people you love
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          One assessment away from a safer home
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          Most fall injuries happen at home, and most are preventable. StayHome
          finds the hazards, scores the risk, and connects you with contractors
          who fix what matters — so your loved ones can stay where they belong.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Start Free Assessment
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            See How It Works
          </Link>
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          Free tier. No credit card required.
        </p>
      </section>

      {/* Social Proof */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 px-6 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-3xl font-bold">30</p>
            <p className="text-sm text-zinc-400">Safety hazards checked</p>
          </div>
          <div>
            <p className="text-3xl font-bold">7</p>
            <p className="text-sm text-zinc-400">Risk categories covered</p>
          </div>
          <div>
            <p className="text-3xl font-bold">&lt; 10 min</p>
            <p className="text-sm text-zinc-400">Average assessment time</p>
          </div>
          <div>
            <p className="text-3xl font-bold">$0</p>
            <p className="text-sm text-zinc-400">To get started</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Everything you need to make a home safer
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-400">
            From detection to resolution, StayHome handles the full workflow.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-zinc-800 bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Three steps to peace of mind
          </h2>
          <div className="mt-14 space-y-10">
            {STEPS.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 text-sm font-bold text-emerald-400">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Who It's For */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Built for families, not facilities</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            StayHome was built for adult children who worry about a parent living alone,
            caregivers managing safety across multiple homes, and seniors who want to stay
            independent without ignoring the risks. If you&apos;ve ever walked through your
            parents&apos; house and thought &ldquo;that rug is going to hurt someone,&rdquo;
            this is for you.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-800 bg-zinc-900/50 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Start with a free safety assessment
          </h2>
          <p className="mt-4 text-zinc-400">
            Takes under 10 minutes. No credit card. See exactly what needs fixing
            and how to fix it.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-600">
        StayHome Aging In Place
      </footer>
    </div>
  );
}
