export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Stats = {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
  dueToday: number;
};

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUSES: Status[] = ["todo", "in_progress", "done"];
export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function isOverdue(task: Task) {
  if (!task.due_date || task.status === "done") return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.due_date < today;
}
