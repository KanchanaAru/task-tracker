"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_LABEL, isOverdue, type Stats, type Task } from "@/lib/types";

function Figure({
  value,
  label,
  tone = "plain",
}: {
  value: number;
  label: string;
  tone?: "plain" | "alert";
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        tone === "alert" ? "border-warn/50 bg-warn-soft" : "border-line bg-surface"
      }`}
    >
      <p
        className={`numeral text-3xl font-semibold ${tone === "alert" ? "text-warn" : "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [statsRes, tasksRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/tasks"),
      ]);
      const statsJson = await statsRes.json();
      const tasksJson = await tasksRes.json();
      if (statsRes.ok) setStats(statsJson.stats);
      if (tasksRes.ok) setTasks(tasksJson.tasks);
      setLoading(false);
    })();
  }, []);

  const overdue = tasks.filter(isOverdue);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Where everything stands right now.</p>
        </div>
        <Link
          href="/tasks"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Open the board
        </Link>
      </div>

      {loading && <p className="mt-8 text-sm text-ink-soft">Loading your numbers…</p>}

      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Figure value={stats.total} label="All tasks" />
            <Figure value={stats.todo} label={STATUS_LABEL.todo} />
            <Figure value={stats.in_progress} label={STATUS_LABEL.in_progress} />
            <Figure value={stats.done} label={STATUS_LABEL.done} />
            <Figure value={stats.overdue} label="Overdue" tone="alert" />
          </div>

          <p className="mt-3 text-sm text-ink-soft">
            {stats.dueToday > 0
              ? `${stats.dueToday} task${stats.dueToday === 1 ? "" : "s"} due today.`
              : "Nothing is due today."}
          </p>

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              Past the due date
            </h2>

            {overdue.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
                Nothing is late. Keep it that way.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line rounded-lg border border-warn/50 bg-warn-soft">
                {overdue.map((task) => (
                  <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="flex-1 text-sm font-medium">{task.title}</span>
                    <span className="text-xs text-ink-soft">{STATUS_LABEL[task.status]}</span>
                    <span className="numeral text-xs font-medium text-warn">
                      {task.due_date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
