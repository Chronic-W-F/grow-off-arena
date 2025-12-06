"use client";

import { FormEvent, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2 text-center">
          Grow-Off Arena
        </h1>
        <p className="text-sm text-slate-400 mb-6 text-center">
          {mode === "login"
            ? "Log in to your grow-off account"
            : "Create an account to join grow competitions"}
        </p>

        <div className="flex justify-center gap-2 mb-6 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-3 py-1 rounded-full border ${
              mode === "login"
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-slate-700"
            }`}
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`px-3 py-1 rounded-full border ${
              mode === "signup"
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-slate-700"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Minimum 6 characters.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md px-2 py-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading
              ? "Working..."
              : mode === "signup"
              ? "Create account"
              : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
