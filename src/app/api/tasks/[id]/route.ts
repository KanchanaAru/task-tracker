import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { PRIORITIES, STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/tasks/:id — edit any field, including status changes */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const patch: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return NextResponse.json({ error: "Add a title before saving." }, { status: 400 });
    patch.title = title;
  }
  if (body.description !== undefined) patch.description = body.description?.trim() || null;
  if (body.due_date !== undefined) patch.due_date = body.due_date || null;
  if (body.priority !== undefined) {
    if (!(PRIORITIES as string[]).includes(body.priority))
      return NextResponse.json({ error: "Unknown priority." }, { status: 400 });
    patch.priority = body.priority;
  }
  if (body.status !== undefined) {
    if (!(STATUSES as string[]).includes(body.status))
      return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    patch.status = body.status;
  }

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  return NextResponse.json({ task: data });
}

/** DELETE /api/tasks/:id */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
