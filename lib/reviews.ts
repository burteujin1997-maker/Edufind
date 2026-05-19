import { supabase } from "./supabase";

export type Review = {
  id: string;
  school_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function getReviews(school_id: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("school_id", school_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addReview(review: {
  school_id: string;
  author_name: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data;
}