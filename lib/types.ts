export type Category = "ebs" | "ids" | "surgalt";

export interface School {
  id: string;
  name: string;
  slug: string;
  category: Category;
  subcategory?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  description?: string | null;
  features?: string[] | null;
  tuition_min?: number | null;
  tuition_max?: number | null;
  logo_url?: string | null;
  images?: string[] | null;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  district?: string;
  features?: string[];
  tuition_max?: number;
  sort?: "name" | "tuition_asc" | "tuition_desc" | "newest";
}

export const CATEGORIES: Record<Category, string> = {
  ebs: "ЕБС",
  ids: "Их Дээд Сургууль",
  surgalt: "Сургалтын байгууллага",
};

export const DISTRICTS = [
  "БЗД",
  "БГД",
  "СБД",
  "ЧД",
  "ХУД",
  "СОД",
  "СХД",
  "Налайх",
  "Багануур",
];

export const FEATURE_OPTIONS = [
  "Англи хэл",
  "Хятад хэл",
  "Япон хэл",
  "Солонгос хэл",
  "Герман хэл",
  "Орос хэл",
  "Cambridge",
  "IB",
  "IGCSE",
  "STEM",
  "AP",
  "Математик",
  "Физик",
];

export const SORT_OPTIONS = [
  { value: "name", label: "Нэрээр" },
  { value: "tuition_asc", label: "Үнэ: багаас их" },
  { value: "tuition_desc", label: "Үнэ: ихээс бага" },
  { value: "newest", label: "Шинэ нэмэгдсэн" },
];
