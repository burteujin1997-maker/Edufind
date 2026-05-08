"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SchoolCard from "@/components/SchoolCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, DISTRICTS, FEATURE_OPTIONS, SORT_OPTIONS, type School, type SearchFilters } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  initialSchools: School[];
  initialFilters: SearchFilters;
  view: "grid" | "list";
}

export default function SearchClient({ initialSchools, initialFilters, view: initView }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [queryInput, setQueryInput] = useState(initialFilters.query ?? "");
  const [view, setView] = useState<"grid" | "list">(initView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tuitionMax, setTuitionMax] = useState(
    initialFilters.tuition_max ?? 20_000_000
  );
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    district: true,
    features: false,
    tuition: true,
  });

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.set(key, value);
          }
        }
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: queryInput || undefined });
  }

  function handleCategory(cat: string) {
    const current = searchParams.get("category");
    updateParams({ category: current === cat ? undefined : cat });
  }

  function handleDistrict(d: string) {
    const current = searchParams.get("district");
    updateParams({ district: current === d ? undefined : d });
  }

  function handleFeature(feature: string) {
    const current = searchParams.getAll("features");
    const next = current.includes(feature)
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    updateParams({ features: next.length > 0 ? next : undefined });
  }

  function handleSort(val: string) {
    updateParams({ sort: val === "name" ? undefined : val });
  }

  function handleTuitionCommit(val: number) {
    updateParams({
      tuition_max: val < 20_000_000 ? String(val) : undefined,
    });
  }

  function clearAll() {
    router.push(pathname);
    setQueryInput("");
    setTuitionMax(20_000_000);
  }

  const activeCategory = searchParams.get("category") ?? "";
  const activeDistrict = searchParams.get("district") ?? "";
  const activeFeatures = searchParams.getAll("features");
  const activeSort = searchParams.get("sort") ?? "name";

  const hasFilters = !!(activeCategory || activeDistrict || activeFeatures.length || searchParams.get("tuition_max") || initialFilters.query);

  function toggle(key: keyof typeof expandedSections) {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }));
  }

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div>
      <button
        onClick={() => toggle(sectionKey)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[#1a3a5c]"
      >
        {title}
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expandedSections[sectionKey] && <div className="mt-2 space-y-1.5">{children}</div>}
    </div>
  );

  const FiltersContent = () => (
    <div className="space-y-4">
      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>
          <X className="mr-1 h-3 w-3" /> Бүх filter арилгах
        </Button>
      )}

      <FilterSection title="Ангилал" sectionKey="category">
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={activeCategory === key}
              onCheckedChange={() => handleCategory(key)}
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </FilterSection>

      <Separator />

      <FilterSection title="Дүүрэг" sectionKey="district">
        {DISTRICTS.map((d) => (
          <label key={d} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={activeDistrict === d}
              onCheckedChange={() => handleDistrict(d)}
            />
            <span className="text-sm">{d}</span>
          </label>
        ))}
      </FilterSection>

      <Separator />

      <FilterSection title="Онцлог / Хэл / Хөтөлбөр" sectionKey="features">
        {FEATURE_OPTIONS.map((f) => (
          <label key={f} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={activeFeatures.includes(f)}
              onCheckedChange={() => handleFeature(f)}
            />
            <span className="text-sm">{f}</span>
          </label>
        ))}
      </FilterSection>

      <Separator />

      <FilterSection title="Жилийн төлбөр" sectionKey="tuition">
        <div className="px-1">
          <Slider
            min={0}
            max={20_000_000}
            step={500_000}
            value={[tuitionMax]}
            onValueChange={([v]) => setTuitionMax(v)}
            onValueCommit={([v]) => handleTuitionCommit(v)}
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>0 ₮</span>
            <span className="font-medium text-[#1a3a5c]">
              {tuitionMax >= 20_000_000 ? "Хязгааргүй" : formatPrice(tuitionMax)}
            </span>
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Хайлт</h1>
          <p className="text-sm text-gray-500">
            {isPending ? "Хайж байна..." : `${initialSchools.length} байгууллага олдлоо`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <SlidersHorizontal className="mr-1 h-4 w-4" />
            Filter
            {hasFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-[#1ea572] inline-block" />
            )}
          </Button>

          {/* Sort */}
          <Select value={activeSort} onValueChange={handleSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Эрэмбэлэх" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex rounded-md border overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-[#1a3a5c] text-white" : "text-gray-400 hover:bg-gray-50"}`}
              title="Grid харагдац"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-[#1a3a5c] text-white" : "text-gray-400 hover:bg-gray-50"}`}
              title="List харагдац"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Сургуулийн нэр хайх..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Хайх</Button>
      </form>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="rounded-lg border bg-white p-4 shadow-sm sticky top-20">
            <h2 className="mb-3 font-semibold text-[#1a3a5c]">Filter</h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-72 overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-[#1a3a5c]">Filter</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FiltersContent />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {isPending ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a3a5c] border-t-transparent" />
            </div>
          ) : initialSchools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700">Олдсонгүй</h3>
              <p className="mt-1 text-sm text-gray-500">
                Хайлтын нөхцөлөө өөрчилж дахин оролдоно уу
              </p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>
                Бүх filter арилгах
              </Button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {initialSchools.map((school) => (
                <SchoolCard key={school.id} school={school} view="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {initialSchools.map((school) => (
                <SchoolCard key={school.id} school={school} view="list" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
