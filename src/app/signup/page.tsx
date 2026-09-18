"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signUp() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    if (!data.session) {
      setNotice("Check your inbox to confirm the address, then sign in.");
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
          Create your account
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Takes about ten seconds.</p>

        <div className="mt-8 space-y-4 rounded-lg border border-line bg-surface p-6">
          <label className="block text-sm">
            <span className="text-ink-soft">Name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
            />
          </label>

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
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
            />
            <span className="mt-1 block text-xs text-ink-soft">At least 6 characters.</span>
          </label>

          {error && <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error}</p>}
          {notice && <p className="rounded-md bg-go-soft px-3 py-2 text-sm text-go">{notice}</p>}

          <button
            onClick={signUp}
            disabled={busy || !email || password.length < 6}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </div>

        <p className="mt-5 text-sm text-ink-soft">
          Already registered?{" "}
          <Link href="/login" className="text-accent underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
