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
  is_approved?: boolean;
  tier?: string | null;
  video_url?: string | null;
  contact_person?: string | null;
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
  "БЗД", "БГД", "СБД", "ЧД", "ХУД", "СОД", "СХД", "Налайх", "Багануур",
];

export const EBS_FEATURES = [
  "Cambridge", "IB", "IGCSE", "AP", "STEM",
  "Англи хэл", "Хятад хэл", "Япон хэл", "Солонгос хэл", "Герман хэл", "Орос хэл",
  "Математик", "Физик", "Биологи", "Хими", "Урлаг", "Спорт", "Робот",
];

export const IDS_FEATURES = [
  "Анагаах ухаан", "Эрх зүй", "Эдийн засаг", "Бизнесийн удирдлага",
  "Санхүү", "Нягтлан бодох бүртгэл", "Маркетинг",
  "Мэдээллийн технологи", "Программ хангамж", "Кибер аюулгүй байдал",
  "Инженерчлэл", "Барилга", "Архитектур", "Байгаль орчин",
  "Хөдөө аж ахуй", "Боловсрол", "Сэтгүүл зүй", "Нийгмийн ухаан",
  "Сэтгэл судлал", "Олон улсын харилцаа", "Хэл шинжлэл",
  "Англи хэл", "Хятад хэл", "Япон хэл", "Солонгос хэл",
  "Урлаг, дизайн", "Хөгжим", "Эмнэлгийн тусламж",
  "Нисэх онгоцны мэргэжил", "Жуулчлал, зочид буудал",
];

export const SURGALT_FEATURES = [
  "Англи хэл", "Хятад хэл", "Япон хэл", "Солонгос хэл", "Герман хэл", "Орос хэл", "Франц хэл",
  "Математик", "Физик", "Хими", "Биологи",
  "Программчлал", "График дизайн", "Видео монтаж", "Фото зураг",
  "Хөгжим", "Төгөлдөр хуур", "Гитар", "Бүжиг", "Дуулах", "Уран зураг",
  "Шатар", "Тэмцээний бэлтгэл",
  "IELTS бэлтгэл", "TOEFL бэлтгэл", "SAT бэлтгэл",
  "Жолооны сургалт", "Гагнуурын сургалт", "Гоо сайхан", "Тогооч", "Оёдол",
  "Нягтлан бодох бүртгэл", "Мэдээллийн технологи",
];

export const FEATURE_OPTIONS = Array.from(
  new Set([...EBS_FEATURES, ...IDS_FEATURES, ...SURGALT_FEATURES])
);

export const SORT_OPTIONS = [
  { value: "name", label: "Нэрээр" },
  { value: "tuition_asc", label: "Үнэ: багаас их" },
  { value: "tuition_desc", label: "Үнэ: ихээс бага" },
  { value: "newest", label: "Шинэ нэмэгдсэн" },
];