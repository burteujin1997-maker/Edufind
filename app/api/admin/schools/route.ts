import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSchool } from "@/lib/schools";

function requireAdmin() {
  const cookieStore = cookies();
  if (cookieStore.get("admin_session")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authError = requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const school = await createSchool(body);
    return NextResponse.json(school);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
