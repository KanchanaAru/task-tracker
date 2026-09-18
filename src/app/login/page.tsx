"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Task Tracker
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Your board, your tasks, nobody else&apos;s.
        </p>

        <div className="mt-8 space-y-4 rounded-lg border border-line bg-surface p-6">
          <label className="block text-sm">
            <span className="text-ink-soft">Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
            />
          </label>

          <label className="block text-sm">
            <span className="text-ink-soft">Password</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
            />
          </label>

          {error && (
            <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error}</p>
          )}

          <button
            onClick={signIn}
            disabled={busy || !email || !password}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <p className="mt-5 text-sm text-ink-soft">
          No account yet?{" "}
          <Link href="/signup" className="text-accent underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
