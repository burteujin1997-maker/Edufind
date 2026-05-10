import Link from "next/link";
import { Suspense } from "react";
import { Search, BookOpen, Building2, GraduationCap, ArrowRight } from "lucide-react";
import { getFeaturedSchools, getStats } from "@/lib/schools";
import SchoolCard from "@/components/SchoolCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import HeroSearch from "@/components/HeroSearch";
import SponsoredBanners from "@/components/SponsoredBanners";

async function FeaturedSchools() {
  const schools = await getFeaturedSchools();
  if (schools.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {schools.map((school) => (
        <SchoolCard key={school.id} school={school} />
      ))}
    </div>
  );
}

async function Stats() {
  const stats = await getStats();
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-white">{stats.total}+</p>
        <p className="text-sm text-blue-200">Байгууллага</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-white">{stats.districts}</p>
        <p className="text-sm text-blue-200">Дүүрэг</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-white">{stats.categories}</p>
        <p className="text-sm text-blue-200">Ангилал</p>
      </div>
    </div>
  );
}

const CATEGORIES = [
  {
    href: "/search?category=ebs",
    icon: BookOpen,
    label: "Ерөнхий боловсролын сургууль",
    short: "ЕБС",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600 bg-blue-100",
  },
  {
    href: "/search?category=ids",
    icon: GraduationCap,
    label: "Их Дээд Сургууль",
    short: "ИДС",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600 bg-green-100",
  },
  {
    href: "/search?category=surgalt",
    icon: Building2,
    label: "Сургалтын байгууллага",
    short: "Сургалт",
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    iconColor: "text-amber-600 bg-amber-100",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c] py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            Өөрт тохирох сургуулиа <br />
            <span className="text-[#1ea572]">хайж олоорой</span>
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Улаанбаатар хотын ЕБС, их дээд сургууль, сургалтын байгууллагыг нэг дороос харцгаая
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
          <div className="mt-10">
            <Suspense
              fallback={
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded skeleton opacity-30" />
                  ))}
                </div>
              }
            >
              <Stats />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Sponsored баннер */}
      <Suspense fallback={null}>
        <SponsoredBanners />
      </Suspense>

      {/* Category filters */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-[#1a3a5c]">Ангиллаар хайх</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`group flex items-center gap-4 rounded-xl border-2 p-5 transition-all ${cat.color}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${cat.iconColor}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1a3a5c]">{cat.short}</p>
                  <p className="text-sm text-gray-600">{cat.label}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured schools */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1a3a5c]">Онцлох сургуулиуд</h2>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-[#1ea572] hover:underline">
              Бүгдийг харах <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Suspense fallback={<SkeletonGrid count={6} />}>
            <FeaturedSchools />
          </Suspense>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-2xl bg-[#1a3a5c] p-8 text-white">
            <h2 className="text-2xl font-bold">Байгууллагаа бүртгүүлэх үү?</h2>
            <p className="mt-2 text-blue-200">
              Таны сургалтын байгууллагыг EduFind.mn-д бүртгүүлж, олон мянган хайгчид хүрч очоорой.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1ea572] px-6 py-3 font-medium text-white hover:bg-[#25c588] transition-colors"
            >
              <Search className="h-4 w-4" />
              Мэдээлэл илгээх
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
