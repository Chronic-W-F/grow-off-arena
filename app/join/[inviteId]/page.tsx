"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

type InviteDoc = {
  arenaId?: string;
  competitionId?: string | null;
  role?: "judge" | "participant";
  status?: string;
};

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();

  const inviteId = params?.inviteId
    ? Array.isArray(params.inviteId)
      ? params.inviteId[0]
      : params.inviteId
    : "";

  const [invite, setInvite] = useState<InviteDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      if (!inviteId) return;

      try {
        const ref = doc(db, "invites", String(inviteId));
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("This invite link is invalid or has expired.");
        } else {
          const data = snap.data() as InviteDoc;
          if (data.status && data.status !== "pending") {
            setError("This invite has already been used or is no longer active.");
          } else {
            setInvite(data);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load invite.");
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [inviteId]);

  const user = auth.currentUser;

  async function handleAccept() {
    if (!inviteId || !invite) return;
    if (!user) {
      setError("You must be signed in to accept an invite.");
      return;
    }
    if (!invite.arenaId || !invite.role) {
      setError("Invite is missing arena or role information.");
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      const arenaId = invite.arenaId;

      // 1) Grant role in this arena
      const roleRef = doc(db, "arenas", arenaId, "roles", user.uid);
      await setDoc(
        roleRef,
        {
          role: invite.role,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 2) Mark invite as accepted
      const inviteRef = doc(db, "invites", String(inviteId));
      await updateDoc(inviteRef, {
        status: "accepted",
        acceptedBy: user.uid,
        acceptedAt: new Date(),
        usedCount: increment(1),
      });

      // 3) Send them to the arena (later we can go to a specific competition)
      router.push(`/arena/${arenaId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to accept invite. Please try again.");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading invite…</p>
      </main>
    );
  }

  if (error || !invite) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-2xl font-semibold">Invite problem</h1>
          <p className="text-sm text-slate-400">
            {error ?? "This invite is not valid."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const roleLabel =
    invite.role === "judge" ? "Judge" : invite.role === "participant" ? "Participant" : "Guest";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-lg w-full px-6 py-10 text-center">
        <h1 className="text-2xl font-semibold mb-2">Grow-Off Arena Invite</h1>
        <p className="text-slate-400 text-sm mb-6">
          You&apos;ve been invited to join an arena as a{" "}
          <span className="font-semibold">{roleLabel}</span>.
        </p>

        {user ? (
          <>
            <p className="text-xs text-slate-500 mb-4">
              Signed in as <span className="font-mono">{user.email ?? user.uid}</span>
            </p>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60"
            >
              {accepting ? "Accepting…" : "Accept invite"}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4">
              You need to sign in or create an account to accept this invite.
            </p>
            <Link
              href={`/auth?next=/join/${String(inviteId)}`}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition"
            >
              Sign in / Sign up
            </Link>
          </>
        )}

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
