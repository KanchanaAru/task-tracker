"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/tasks", label: "Board" },
];

export default function Nav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight"
        >
          Task Tracker
        </Link>

        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm ${
                pathname === l.href
                  ? "bg-accent-soft text-accent"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-ink-soft sm:inline">{email}</span>
          <button
            onClick={signOut}
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
