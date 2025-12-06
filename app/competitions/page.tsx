"use client";

import Link from "next/link";

export default function CompetitionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-3xl w-full px-6 py-10 text-center">
        <h1 className="text-3xl font-semibold mb-3">Competitions</h1>

        <p className="text-slate-400 text-sm mb-6">
          This page will eventually list all active, public grow-off competitions.
          For now, competitions live inside each Arena you create.
        </p>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
