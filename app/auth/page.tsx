"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // Optional: store basic user profile
        const userRef = doc(db, "users", cred.user.uid);
        await setDoc(
          userRef,
          {
            email,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push(next || "/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full px-6 py-10">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Grow-Off Arena
        </h1>
        <p className="text-slate-400 text-sm mb-6 text-center">
          {mode === "signup"
            ? "Create an account to host or join grow competitions."
            : "Sign in to access your arenas and competitions."}
        </p>

        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-3 py-1 text-xs rounded-full border ${
              mode === "login"
                ? "bg-slate-100 text-slate-900 border-slate-100"
                : "border-slate-700 text-slate-400"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-3 py-1 text-xs rounded-full border ${
              mode === "signup"
                ? "bg-slate-100 text-slate-900 border-slate-100"
                : "border-slate-700 text-slate-400"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs text-slate-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-400">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Minimum 6 characters.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md px-3 py-2">
              Firebase: {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60"
          >
            {loading
              ? mode === "signup"
                ? "Creating account…"
                : "Signing in…"
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
