"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
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
  createdAt?: any; // Firestore Timestamp
};

export default function ArenaPage() {
  const params = useParams();
  const arenaId = params?.arenaId
    ? Array.isArray(params.arenaId)
      ? params.arenaId[0]
      : params.arenaId
    : "";

  const [arena, setArena] = useState<ArenaDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [competitions, setCompetitions] = useState<CompetitionDoc[]>([]);
  const [loadingComps, setLoadingComps] = useState(true);

  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Load arena details
  useEffect(() => {
    async function loadArena() {
      if (!arenaId) return;

      try {
        const ref = doc(db, "arenas", String(arenaId));
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("This arena does not exist.");
        } else {
          setArena(snap.data() as ArenaDoc);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load arena.");
      } finally {
        setLoading(false);
      }
    }

    loadArena();
  }, [arenaId]);

  // Load competitions for this arena
  useEffect(() => {
    async function loadCompetitions() {
      if (!arenaId) return;
      setLoadingComps(true);

      try {
        const compsRef = collection(
          db,
          "arenas",
          String(arenaId),
          "competitions"
        );
        const snap = await getDocs(compsRef);

        const list: CompetitionDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CompetitionDoc, "id">),
        }));

        setCompetitions(list);
      } catch (err) {
        console.error("Failed to load competitions:", err);
      } finally {
        setLoadingComps(false);
      }
    }

    loadCompetitions();
  }, [arenaId]);

  // Create invite and copy link
  async function handleCreateInvite(role: "judge" | "participant") {
    if (!arenaId) return;

    try {
      setInviteLoading(true);
      setInviteMessage(null);

      const invitesRef = collection(db, "invites");
      const inviteDoc = await addDoc(invitesRef, {
        arenaId: String(arenaId),
        competitionId: null, // later we can target specific competitions
        role,
        status: "pending",
        maxUses: 100,
        usedCount: 0,
        createdAt: serverTimestamp(),
      });

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/join/${inviteDoc.id}`;

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setInviteMessage(
          `Copied ${role} invite link to your clipboard. Paste it to share.`
        );
      } else {
        setInviteMessage(`Invite link created: ${url}`);
      }
    } catch (err) {
      console.error("Failed to create invite link:", err);
      setInviteMessage("Failed to create invite link. Try again.");
    } finally {
      setInviteLoading(false);
    }
  }

  // ---------- Loading & error states ----------

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

  // ---------- Normal render ----------

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-4xl w-full px-6 py-10">
        {/* Arena header */}
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

        <div className="space-y-3 text-sm text-slate-300 mb-8">
          <p>This will be the control center for this arena.</p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Create and manage grow-off competitions</li>
            <li>Add judges and define scoring categories</li>
            <li>Invite growers to join this arena</li>
            <li>View leaderboards and check-ins</li>
          </ul>
        </div>

        {/* Primary actions */}
        <div className="flex flex-wrap gap-3 mb-8">
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

        {/* Invite section */}
        <section className="mb-10 border border-slate-800 bg-slate-900/40 rounded-xl px-4 py-4">
          <h2 className="text-sm font-semibold mb-2">
            Invite people to this arena
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Generate a link and paste it to your judges or growers. When they
            sign in with that link, they&apos;ll be added to this arena with the
            correct role.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCreateInvite("judge")}
              disabled={inviteLoading}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium hover:border-emerald-400 hover:text-emerald-300 transition disabled:opacity-60"
            >
              {inviteLoading ? "Working…" : "Copy judge invite link"}
            </button>
            <button
              onClick={() => handleCreateInvite("participant")}
              disabled={inviteLoading}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium hover:border-emerald-400 hover:text-emerald-300 transition disabled:opacity-60"
            >
              {inviteLoading ? "Working…" : "Copy participant invite link"}
            </button>
          </div>
          {inviteMessage && (
            <p className="mt-3 text-[11px] text-slate-400">
              {inviteMessage}
            </p>
          )}
        </section>

        {/* Competitions list */}
        <section>
          <h2 className="text-sm font-semibold mb-3">
            Competitions in this arena
          </h2>
          {loadingComps ? (
            <p className="text-xs text-slate-500">Loading competitions…</p>
          ) : competitions.length === 0 ? (
            <p className="text-xs text-slate-500">
              No competitions yet. Start one above.
            </p>
          ) : (
            <ul className="space-y-2">
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
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {comp.name ?? "Untitled competition"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Status:{" "}
                        <span className="capitalize">
                          {comp.status ?? "unknown"}
                        </span>
                        {created && <> · Created {created}</>}
                      </p>
                    </div>
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
