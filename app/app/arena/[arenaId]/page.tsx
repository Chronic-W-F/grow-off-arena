"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

type ArenaDoc = {
  name?: string;
  ownerId?: string;
  ownerEmail?: string | null;
};

export default function ArenaPage({
  params,
}: {
  params: { arenaId: string };
}) {
  const { arenaId } = params;

  const [arena, setArena] = useState<ArenaDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArena() {
      try {
        const ref = doc(db, "arenas", arenaId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("This arena does not exist.");
        } else {
          setArena(snap.data() as ArenaDoc);
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to load arena.");
      } finally {
        setLoading(false);
      }
    }

    loadArena();
  }, [arenaId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading arena…</p>
      </main>
    );
  }

  if (error || !arena) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Arena not found</h1>
          <p className="text-slate-400 text-sm">
            {error ?? "We couldn&apos;t find this arena."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-3xl w-full px-6 py-10">
        <p className="text-xs text-slate-500 mb-2">Arena ID: {arenaId}</p>
        <h1 className="text-3xl font-semibold mb-2">
          {arena.name ?? "Untitled Arena"}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Organizer:{" "}
          <span className="font-mono">
            {arena.ownerEmail ?? arena.ownerId ?? "Unknown"}
          </span>
        </p>

        <div className="space-y-3 text-sm">
          <p className="text-slate-300">
            This will be the control center for this arena. From here you&apos;ll
            eventually be able to:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Create and manage grow-off competitions</li>
            <li>Add judges and define scoring categories</li>
            <li>Invite growers to join this arena</li>
            <li>View leaderboards and check-ins</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
