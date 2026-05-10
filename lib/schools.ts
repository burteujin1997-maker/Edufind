import { supabase } from "./supabase";
import type { School, SearchFilters } from "./types";

export async function getSchools(filters: SearchFilters = {}): Promise<School[]> {
  let query = supabase.from("schools").select("*");

  if (filters.query) {
    query = query.ilike("name", `%${filters.query}%`);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.district) {
    query = query.eq("district", filters.district);
  }
  if (filters.features && filters.features.length > 0) {
    query = query.overlaps("features", filters.features);
  }
  if (filters.tuition_max) {
    query = query.or(`tuition_min.lte.${filters.tuition_max},tuition_min.is.null`);
  }

  switch (filters.sort) {
    case "tuition_asc":
      query = query.order("tuition_min", { ascending: true, nullsFirst: false });
      break;
    case "tuition_desc":
      query = query.order("tuition_max", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("name", { ascending: true });
  }

  const { data, error } = await query;
  export async function getFeaturedSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("is_featured", true)
    .order("name")
    .limit(6);
  if (error) throw error;

  const sorted = (data ?? []).sort((a, b) => {
    if (a.tier === "premium" && b.tier !== "premium") return -1;
    if (a.tier !== "premium" && b.tier === "premium") return 1;
    if (a.tier === "standard" && b.tier === "basic") return -1;
    if (a.tier === "basic" && b.tier === "standard") return 1;
    return 0;
  });

  return sorted;
}
    .select("*")
    .eq("is_featured", true)
    .order("name")
    .limit(6);
  if (error) throw error;
  return data ?? [];
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getStats() {
  const { count: total } = await supabase
    .from("schools")
    .select("*", { count: "exact", head: true });

  const { data: districts } = await supabase
    .from("schools")
    .select("district")
    .not("district", "is", null);

  const uniqueDistricts = new Set(districts?.map((d) => d.district)).size;

  const { data: categories } = await supabase
    .from("schools")
    .select("category");

  const uniqueCategories = new Set(categories?.map((c) => c.category)).size;

  return {
    total: total ?? 0,
    districts: uniqueDistricts,
    categories: uniqueCategories,
  };
}

export async function createSchool(
  school: Omit<School, "id" | "created_at">
): Promise<School> {
  const { data, error } = await supabase
    .from("schools")
    .insert(school)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSchool(
  id: string,
  school: Partial<School>
): Promise<School> {
  const { data, error } = await supabase
    .from("schools")
    .update(school)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSchool(id: string): Promise<void> {
  const { error } = await supabase.from("schools").delete().eq("id", id);
  if (error) throw error;
}

export async function getAllSchoolsAdmin(): Promise<School[]> {
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
