"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

type ArenaDoc = {
  name?: string;
  ownerId?: string;
  ownerEmail?: string | null;
};

type CompetitionDoc = {
  id: string;
  name?: string;
  status?: string;
  createdAt?: any; // Firestore Timestamp or undefined
};

export default function ArenaPage() {
  const params = useParams();
  const arenaId = params?.arenaId
    ? Array.isArray(params.arenaId)
      ? params.arenaId[0]
      : params.arenaId
    : "";

  const [arena, setArena] = useState<ArenaDoc | null>(null);
  const [loadingArena, setLoadingArena] = useState(true);
  const [arenaError, setArenaError] = useState<string | null>(null);

  const [competitions, setCompetitions] = useState<CompetitionDoc[]>([]);
  const [loadingComps, setLoadingComps] = useState(true);
  const [compsError, setCompsError] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  useEffect(() => {
    if (!arenaId) return;

    async function loadData() {
      setLoadingArena(true);
      setLoadingComps(true);
      setArenaError(null);
      setCompsError(null);

      try {
        // 1) Load arena doc
        const arenaRef = doc(db, "arenas", String(arenaId));
        const arenaSnap = await getDoc(arenaRef);

        if (!arenaSnap.exists()) {
          setArenaError("This arena does not exist.");
          setLoadingArena(false);
          setLoadingComps(false);
          return;
        }

        setArena(arenaSnap.data() as ArenaDoc);
        setLoadingArena(false);

        // 2) Load competitions for this arena (exclude archived)
        const compsRef = collection(
          db,
          "arenas",
          String(arenaId),
          "competitions"
        );

        const q = query(
          compsRef,
          where("status", "in", ["draft", "upcoming", "active", "completed"])
        );

        const compsSnap = await getDocs(q);
        const list: CompetitionDoc[] = compsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CompetitionDoc, "id">),
        }));

        setCompetitions(list);
        setLoadingComps(false);
      } catch (err) {
        console.error(err);
        setArenaError((prev) => prev ?? "Failed to load arena.");
        setCompsError("Failed to load competitions.");
        setLoadingArena(false);
        setLoadingComps(false);
      }
    }

    loadData();
  }, [arenaId]);

  async function handleArchiveCompetition(id: string) {
    if (!arenaId) return;

    try {
      setArchivingId(id);
      const compRef = doc(
        db,
        "arenas",
        String(arenaId),
        "competitions",
        String(id)
      );
      await updateDoc(compRef, { status: "archived" });

      // Remove from UI list
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to archive competition:", err);
      alert("Failed to archive competition.");
    } finally {
      setArchivingId(null);
    }
  }

  // ---------- Loading & error states for arena ----------

  if (loadingArena) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading arena…</p>
      </main>
    );
  }

  if (arenaError || !arena) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Arena not found</h1>
          <p className="text-slate-400 text-sm">
            {arenaError ?? "We couldn&apos;t find this arena."}
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

  // ---------- Normal render ----------

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-3xl w-full px-6 py-10 space-y-8">
        {/* Arena header */}
        <section>
          <p className="text-xs text-slate-500 mb-2">
            Arena ID: {String(arenaId)}
          </p>
          <h1 className="text-3xl font-semibold mb-2">
            {arena.name ?? "Untitled Arena"}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            Organizer:{" "}
            <span className="font-mono">
              {arena.ownerEmail ?? arena.ownerId ?? "Unknown"}
            </span>
          </p>

          <div className="space-y-3 text-sm text-slate-300">
            <p>This will be the control center for this arena.</p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Create and manage grow-off competitions</li>
              <li>Add judges and define scoring categories</li>
              <li>Invite growers to join this arena</li>
              <li>View leaderboards and check-ins</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href={`/arena/${String(arenaId)}/competitions/create`}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-medium text-white transition"
            >
              Start a competition
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
            >
              Back to dashboard
            </Link>
          </div>
        </section>

        {/* Competitions list */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Competitions in this arena
          </h2>

          {loadingComps && (
            <p className="text-slate-400 text-sm">Loading competitions…</p>
          )}

          {compsError && !loadingComps && (
            <p className="text-red-400 text-sm">{compsError}</p>
          )}

          {!loadingComps && !compsError && competitions.length === 0 && (
            <p className="text-slate-500 text-sm">
              No active competitions yet. Start one above.
            </p>
          )}

          {!loadingComps && competitions.length > 0 && (
            <ul className="space-y-3 mt-2">
              {competitions.map((comp) => {
                const created =
                  comp.createdAt && comp.createdAt.toDate
                    ? comp.createdAt
                        .toDate()
                        .toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                    : null;

                return (
                  <li
                    key={comp.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {comp.name ?? "Untitled competition"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status:{" "}
                        <span className="capitalize">
                          {comp.status ?? "unknown"}
                        </span>
                        {created && <> · Created {created}</>}
                      </p>
                    </div>

                    <button
                      onClick={() => handleArchiveCompetition(comp.id)}
                      disabled={archivingId === comp.id}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-amber-400 hover:text-amber-300 transition disabled:opacity-50"
                    >
                      {archivingId === comp.id ? "Archiving…" : "Archive"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
