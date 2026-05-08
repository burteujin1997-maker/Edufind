import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} сая ₮`;
  }
  return `${amount.toLocaleString()} ₮`;
}

export function formatPriceRange(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Мэдээлэлгүй";
  if (min && max && min === max) return formatPrice(min);
  if (min && max) return `${formatPrice(min)} — ${formatPrice(max)}`;
  if (min) return `${formatPrice(min)}+`;
  if (max) return `Хүртэл ${formatPrice(max)}`;
  return "Мэдээлэлгүй";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}
