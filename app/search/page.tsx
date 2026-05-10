import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Хайлт | EduFind.mn",
  description: "Улаанбаатар хотын ЕБС, их дээд сургууль, сургалтын байгууллагуудыг хайж олоорой.",
  keywords: "сургууль хайх, улаанбаатар сургууль, ЕБС, их дээд сургууль",
  openGraph: {
    title: "Сургууль хайх | EduFind.mn",
    description: "Улаанбаатарын бүх сургалтын байгууллагыг нэг дороос хайж олоорой.",
    type: "website",
  },
};
import { getSchools } from "@/lib/schools";
import type { SearchFilters } from "@/lib/types";
import SearchClient from "./SearchClient";

interface PageProps {
  searchParams: {
    q?: string;
    category?: string;
    district?: string;
    features?: string | string[];
    tuition_max?: string;
    sort?: string;
    view?: string;
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const filters: SearchFilters = {
    query: searchParams.q,
    category: searchParams.category,
    district: searchParams.district,
    features: searchParams.features
      ? Array.isArray(searchParams.features)
        ? searchParams.features
        : [searchParams.features]
      : undefined,
    tuition_max: searchParams.tuition_max ? parseInt(searchParams.tuition_max) : undefined,
    sort: searchParams.sort as SearchFilters["sort"],
  };

  const schools = await getSchools(filters);

  return (
    <Suspense>
      <SearchClient
        initialSchools={schools}
        initialFilters={filters}
        view={(searchParams.view as "grid" | "list") ?? "grid"}
      />
    </Suspense>
  );
}
