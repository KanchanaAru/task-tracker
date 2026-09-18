import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import type { Stats, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/stats — counts for the dashboard, computed server side */
export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("tasks")
    .select("id, status, due_date")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Pick<Task, "id" | "status" | "due_date">[];
  const today = new Date().toISOString().slice(0, 10);

  const stats: Stats = {
    total: rows.length,
    todo: rows.filter((t) => t.status === "todo").length,
    in_progress: rows.filter((t) => t.status === "in_progress").length,
    done: rows.filter((t) => t.status === "done").length,
    overdue: rows.filter((t) => t.status !== "done" && t.due_date && t.due_date < today).length,
    dueToday: rows.filter((t) => t.status !== "done" && t.due_date === today).length,
  };

  return NextResponse.json({ stats });
}
