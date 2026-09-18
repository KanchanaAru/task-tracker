"use client";

import { useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  type Priority,
  type Status,
  type Task,
} from "@/lib/types";

type Props = {
  task?: Task;
  onClose: () => void;
  onSaved: (task: Task) => void;
};

export default function TaskForm({ task, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);

    const payload = {
      title,
      description,
      priority,
      status,
      due_date: dueDate || null,
    };

    const res = await fetch(task ? `/api/tasks/${task.id}` : "/api/tasks", {
      method: task ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not save the task.");
      setBusy(false);
      return;
    }

    onSaved(json.task as Task);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-xl border border-line bg-surface p-5 sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
          {task ? "Edit task" : "New task"}
        </h2>

        <div className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="text-ink-soft">Title</span>
            <input
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write the release notes"
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
            />
          </label>

          <label className="block text-sm">
            <span className="text-ink-soft">Description</span>
            <textarea
              value={description ?? ""}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full resize-y rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="text-ink-soft">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-ink-soft">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-base outline-none focus:border-accent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-ink-soft">Due date</span>
              <input
                type="date"
                value={dueDate ?? ""}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-base outline-none focus:border-accent"
              />
            </label>
          </div>

          {error && <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2 text-sm hover:border-ink"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={busy || !title.trim()}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Saving…" : task ? "Save changes" : "Add task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
