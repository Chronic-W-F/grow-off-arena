"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CreateArenaPage() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-300">
          You must be logged in to create an arena.
        </p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create a new arena document with a generated ID
      const arenaRef = doc(collection(db, "arenas"));
      const arenaId = arenaRef.id;

      await setDoc(arenaRef, {
        name,
        ownerId: user.uid,
        ownerEmail: user.email ?? null,
        createdAt: serverTimestamp(),
      });

      // Give the creator organizer role in this arena
      await setDoc(doc(db, "arenas", arenaId, "roles", user.uid), {
        role: "organizer",
        createdAt: serverTimestamp(),
      });

      // Redirect to arena page (we'll build this view next)
      router.push(`/arena/${arenaId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong creating the arena.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold mb-1">Create Arena</h1>
        <p className="text-slate-400 text-sm mb-3">
          Your arena is your own grow community. You’ll be the organizer for
          this arena.
        </p>

        <div>
          <label className="text-sm mb-1 block">Arena name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:ring-emerald-500 focus:ring-2 outline-none"
            placeholder="e.g., Joe’s Grows, Veterans Grow-Off, Bartonville Arena"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/40 p-2 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 text-slate-950 py-2 font-medium hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Arena"}
        </button>
      </form>
    </main>
  );
}
