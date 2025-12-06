import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-3xl w-full px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-3">
          Grow-Off Arena
        </h1>
        <p className="text-slate-400 mb-8">
          Host and join competitive cannabis grow-offs with scoring, check-ins,
          and leaderboards. Multi-tenant, so each organizer gets their own
          arena.
        </p>

        <div className="flex flex-wrap gap-3">
          {/* Go to dashboard */}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
          >
            Open Dashboard
          </Link>

          {/* View competitions list */}
          <Link
            href="/competitions"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            View Competitions
          </Link>

          {/* Auth page */}
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Sign in / Sign up
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Note: Dashboard features and competition management are still being
          built out. For now, you can sign in and we&apos;ll start wiring your
          arenas and grow-offs.
        </p>
      </div>
    </main>
  );
}
