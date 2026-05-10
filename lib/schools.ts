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
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("is_featured", true)
    .order("name")
    .limit(6);
  if (error) throw error;

  const sorted = (data ?? []).sort((a, b) => {
    if (a.tier