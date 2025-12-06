"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function CreateCompetitionPage() {
  const router = useRouter();
  const { arenaId } = useParams();

  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <p className="text-lg">You must be logged in to create a competition.</p>
      </main>
    );
  }

  function slugify(str) {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!name.trim()) {
        setError("Competition name is required.");
        setLoading(false);
        return;
      }

      const slug = slugify(name);

      const compsRef = collection(
        db,
        "arenas",
        String(arenaId),
        "competitions"
      );

      // Check for duplicate competition names (active, draft, upcoming)
      const q = query(
        compsRef,
        where("slug", "==", slug),
        where("status", "in", ["draft", "upcoming", "active"])
      );

      const existing = await getDocs(q);

      if (!existing.empty) {
        setError(
          "A competition with this name already exists in this arena. Archive the old one before creating a new one."
        );
        setLoading(false);
        return;
      }

      // Create the new competition
      const newRef = doc(compsRef);
      await setDoc(newRef, {
        name,
        slug,
        status: "draft",
        createdAt: serverTimestamp(),
        ownerId: user.uid,
        ownerEmail: user.email ?? null,
      });

      router.push(`/arena/${arenaId}/competitions/${newRef.id}`);
    } catch (err) {
      console.error("Error creating competition:", err);
      setError("Failed to create competition.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12">
      <div className="bg-slate-900 p-8 rounded-xl shadow-xl w-full max-w-lg border border-slate-800">
        <h1 className="text-3xl font-bold mb-4">Create Competition</h1>
        <p className="text-slate-400 mb-6">
          Create a new grow-off competition inside your arena.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-slate-300">Competition Name</label>
            <input
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Joes Grows 2025"
            />
          </div>

          {error && (
            <p className="text-red-400 bg-red-900/30 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Competition"}
          </button>
        </form>
      </div>
    </main>
  );
}
