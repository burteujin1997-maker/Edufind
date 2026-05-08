import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateSchool, deleteSchool } from "@/lib/schools";

function requireAdmin() {
  const cookieStore = cookies();
  if (cookieStore.get("admin_session")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const school = await updateSchool(params.id, body);
    return NextResponse.json(school);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    await deleteSchool(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
