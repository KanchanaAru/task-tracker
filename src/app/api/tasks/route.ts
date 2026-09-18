import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { PRIORITIES, STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/tasks?status=&priority=&q= — list the signed-in user's tasks */
export async function GET(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const q = searchParams.get("q");

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (status && (STATUSES as string[]).includes(status)) query = query.eq("status", status);
  if (priority && (PRIORITIES as string[]).includes(priority)) query = query.eq("priority", priority);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tasks: data });
}

/** POST /api/tasks — create a task */
export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) return NextResponse.json({ error: "Add a title before saving." }, { status: 400 });
  if (body.priority && !(PRIORITIES as string[]).includes(body.priority))
    return NextResponse.json({ error: "Unknown priority." }, { status: 400 });
  if (body.status && !(STATUSES as string[]).includes(body.status))
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title,
      description: body.description?.trim() || null,
      priority: body.priority ?? "medium",
      status: body.status ?? "todo",
      due_date: body.due_date || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data }, { status: 201 });
}
