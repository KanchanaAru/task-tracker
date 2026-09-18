"use client";

import { useCallback, useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  type Priority,
  type Status,
  type Task,
} from "@/lib/types";

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragOver, setDragOver] = useState<Status | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    if (query.trim()) params.set("q", query.trim());

    const res = await fetch(`/api/tasks?${params.toString()}`);
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Could not load tasks.");
      setLoading(false);
      return;
    }

    setError(null);
    setTasks(json.tasks as Task[]);
    setLoading(false);
  }, [priorityFilter, query]);

  useEffect(() => {
    const t = setTimeout(load, query ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  async function changeStatus(task: Task, status: Status) {
    if (task.status === status) return;
    const previous = tasks;
    setTasks((cur) => cur.map((t) => (t.id === task.id ? { ...t, status } : t)));

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setTasks(previous);
      setError("The status change did not save. Try again.");
    }
  }

  async function remove(task: Task) {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    const previous = tasks;
    setTasks((cur) => cur.filter((t) => t.id !== task.id));

    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (!res.ok) {
      setTasks(previous);
      setError("The task was not deleted. Try again.");
    }
  }

  function upsert(task: Task) {
    setTasks((cur) => {
      const exists = cur.some((t) => t.id === task.id);
      return exists ? cur.map((t) => (t.id === task.id ? task : t)) : [task, ...cur];
    });
    setEditing(null);
    setCreating(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />

        <select
          aria-label="Filter by priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>

        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          New task
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error}</p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {STATUSES.map((status) => {
          const column = tasks.filter((t) => t.status === status);
          return (
            <section
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/plain");
                const task = tasks.find((t) => t.id === id);
                if (task) changeStatus(task, status);
              }}
              className={`rounded-xl border p-3 ${
                dragOver === status ? "border-accent bg-accent-soft/50" : "border-line bg-paper"
              }`}
            >
              <div className="flex items-baseline justify-between px-1 pb-3">
                <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold">
                  {STATUS_LABEL[status]}
                </h2>
                <span className="numeral text-sm text-ink-soft">{column.length}</span>
              </div>

              <div className="space-y-3">
                {column.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={changeStatus}
                    onEdit={setEditing}
                    onDelete={remove}
                  />
                ))}

                {!loading && column.length === 0 && (
                  <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-ink-soft">
                    Drop a task here, or add one.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {loading && <p className="mt-6 text-sm text-ink-soft">Loading tasks…</p>}

      {(creating || editing) && (
        <TaskForm
          task={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={upsert}
        />
      )}
    </div>
  );
}
