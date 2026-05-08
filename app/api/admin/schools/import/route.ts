import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

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

  const { rows } = await req.json();
  const supabase = getServiceClient();

  const records = (rows as Record<string, string>[]).map((row) => ({
    name: row.name,
    slug: row.slug ?? slugify(row.name),
    category: (row.category ?? "surgalt") as Category,
    subcategory: row.subcategory || null,
    district: row.district || null,
    address: row.address || null,
    phone: row.phone || null,
    email: row.email || null,
    website: row.website || null,
    facebook: row.facebook || null,
    description: row.description || null,
    features: row.features ? row.features.split(",").map((s) => s.trim()).filter(Boolean) : null,
    tuition_min: row.tuition_min ? parseInt(row.tuition_min) : null,
    tuition_max: row.tuition_max ? parseInt(row.tuition_max) : null,
    logo_url: row.logo_url || null,
    is_featured: row.is_featured === "true",
    is_verified: row.is_verified === "true",
  }));

  const { data, error } = await supabase
    .from("schools")
    .upsert(records, { onConflict: "slug" })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ inserted: data?.length ?? 0 });
}
