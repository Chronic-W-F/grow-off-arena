"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Checking your session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold mb-2">Grow-Off Arena</h1>
          <p className="text-slate-400 text-sm">
            You&apos;re not signed in. Log in to access your dashboard.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
          >
            Go to Sign in / Sign up
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-3xl w-full px-6 py-10">
        <h1 className="text-3xl font-semibold mb-3">Dashboard</h1>
        <p className="text-slate-400 mb-4 text-sm">
          Logged in as <span className="font-mono">{user.email}</span>
        </p>

        <div className="space-y-3 text-sm">
          <p className="text-slate-300">
            This is the start of your Grow-Off Arena. Next up:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Create arenas (organizations)</li>
            <li>Create grow-off competitions inside each arena</li>
            <li>“My Competitions” for growers</li>
          </ul>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
