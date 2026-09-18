"use client";

import {
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  isOverdue,
  type Status,
  type Task,
} from "@/lib/types";

const priorityStyle: Record<Task["priority"], string> = {
  low: "border-line text-ink-soft",
  medium: "border-accent/40 text-accent",
  high: "border-warn/40 text-warn",
};

function formatDue(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

type Props = {
  task: Task;
  onStatusChange: (task: Task, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }: Props) {
  const overdue = isOverdue(task);

  return (
    <article
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
      className={`rounded-lg border bg-surface p-4 ${
        overdue ? "border-warn/60 bg-warn-soft/40" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <h3
          className={`flex-1 text-sm font-medium ${
            task.status === "done" ? "text-ink-soft line-through" : ""
          }`}
        >
          {task.title}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${priorityStyle[task.priority]}`}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-ink-soft">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {task.due_date && (
          <span className={`text-xs ${overdue ? "font-medium text-warn" : "text-ink-soft"}`}>
            {overdue ? "Overdue · " : "Due "}
            {formatDue(task.due_date)}
          </span>
        )}

        <select
          aria-label="Status"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value as Status)}
          className="ml-auto rounded-md border border-line bg-surface px-2 py-1 text-xs outline-none focus:border-accent"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <button
          onClick={() => onEdit(task)}
          className="rounded-md border border-line px-2 py-1 text-xs hover:border-ink"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          className="rounded-md border border-line px-2 py-1 text-xs text-warn hover:border-warn"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
