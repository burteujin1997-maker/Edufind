"use client"
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Search, BookOpen, Building2, GraduationCap, ArrowRight, Star, Users, MapPin, TrendingUp } from "lucide-react";
import SchoolCard from "@/components/SchoolCard";
import HeroSearch from "@/components/HeroSearch";
import SponsoredBanners from "@/components/SponsoredBanners";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  {
    href: "/search?category=ebs",
    icon: BookOpen,
    label: "Ерөнхий боловсролын сургууль",
    short: "ЕБС",
    desc: "Кэмбрижийн, IB, STEM хөтөлбөртэй",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600 bg-blue-100",
    count: "12+",
  },
  {
    href: "/search?category=ids",
    icon: GraduationCap,
    label: "Их Дээд Сургууль",
    short: "ИДС",
    desc: "Анагаах, Эрх зүй, МТ болон бусад",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600 bg-green-100",
    count: "5+",
  },
  {
    href: "/search?category=surgalt",
    icon: Building2,
    label: "Сургалтын байгууллага",
    short: "Сургалт",
    desc: "Хэл, хөгжим, программчлал болон бусад",
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    iconColor: "text-amber-600 bg-amber-100",
    count: "8+",
  },
]

const STATS = [
  { icon: Building2, value: "500+", label: "Байгууллага", color: "text-blue-400" },
  { icon: MapPin, value: "21", label: "Дүүрэг", color: "text-green-400" },
  { icon: Users, value: "1,000+", label: "Үзэлт", color: "text-purple-400" },
  { icon: Star, value: "3", label: "Ангилал", color: "text-amber-400" },
]

const WHY_US = [
  { icon: "🔍", title: "Хялбар хайлт", desc: "Дүүрэг, ангилал, үнийн хязгаараар шүүж хайх боломжтой" },
  { icon: "✅", title: "Баталгаажсан мэдээлэл", desc: "Байгууллага бүрийн мэдээлэл шалгагдсан байна" },
  { icon: "📊", title: "Дэлгэрэнгүй мэдээлэл", desc: "Үнэ, онцлог, зураг, видео бүгдийг нэг дороос харна" },
  { icon: "🆓", title: "Үнэгүй хайлт", desc: "Хэрэглэгчдэд бүрэн үнэгүй, бүртгэл шаардахгүй" },
]

export default function HomePage() {
  const [featuredSchools, setFeaturedSchools] = useState<any[]>([])

  useEffect(() => {
    const fetchSchools = async () => {
      const { data } = await supabase
        .from('schools')
        .select('*')
        .eq('is_featured', true)
        .order('tier', { ascending: false })
        .limit(3)
      if (data) {
        const sorted = data.sort((a: any, b: any) => {
          if (a.tier === 'premium' && b.tier !== 'premium') return -1
          if (a.tier !== 'premium' && b.tier === 'premium') return 1
          return 0
        })
        setFeaturedSchools(sorted)
      }
    }
    fetchSchools()
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f2744] via-[#1a3a5c] to-[#1e4d7b] py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-sm px-4 py-1.5 rounded-full mb-6">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            Монголын тэргүүлэх сургуулийн лавлах
          </div>

          <h1 className="text-4xl font-bold text-white md:text-6xl leading-tight">
            Боловсролыг
            <br />
            <span className="text-[#1ea572]">нэг дороос</span>
          </h1>
          <p className="mt-5 text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Улаанбаатар хотын ЕБС, их дээд сургууль, сургалтын байгууллагыг харьцуулж, өөрт тохирохыг олоорой
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <HeroSearch />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-blue-300 text-sm">Түгээмэл хайлт:</span>
            {['Cambridge', 'STEM', 'Англи хэл', 'БЗД', 'Анагаах'].map((tag) => (
              <Link key={tag} href={`/search?q=${tag}`}
                className="text-xs bg-white/10 hover:bg-white/20 text-blue-100 px-3 py-1 rounded-full transition-colors">
                {tag}
              </Link>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-300 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SponsoredBanners />

      <section className="py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a5c]">Ангиллаар хайх</h2>
            <p className="text-gray-500 mt-2">Өөрт тохирох ангиллыг сонгоно уу</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href}
                className={`group flex items-center gap-4 rounded-2xl border-2 p-5 transition-all ${cat.color}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ${cat.iconColor}`}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1a3a5c]">{cat.short}</p>
                    <span className="text-xs bg-white/70 text-gray-600 px-1.5 py-0.5 rounded-full">{cat.count}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a5c]">Онцлох сургуулиуд</h2>
              <p className="text-gray-500 mt-1">Хамгийн их үзэлттэй байгууллагууд</p>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-[#1ea572] hover:underline">
              Бүгдийг харах <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featuredSchools.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {featuredSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a5c]">Яагаад EduFind.mn?</h2>
            <p className="text-gray-500 mt-2">Монголын анхны сургуулийн лавлах</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_US.map((item) => (
              <div key={item.title} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-gradient-to-br from-[#0f2744] to-[#1a3a5c]">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="text-5xl mb-4">🏫</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Байгууллагаа бүртгүүлэх үү?</h2>
          <p className="text-blue-200 mb-2">
            Таны сургалтын байгууллагыг EduFind.mn-д бүртгүүлж, олон мянган эцэг эх, сурагчдад хүрч очоорой.
          </p>
          <p className="text-green-400 text-sm font-medium mb-6">🎉 Анх удаа бүртгүүлэхэд эхний 3 сард 50% хөнгөлөлт</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1ea572] px-6 py-3 font-medium text-white hover:bg-[#25c588] transition-colors">
              <Search className="h-4 w-4" />
              Одоо бүртгүүлэх
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-6 py-3 font-medium text-white transition-colors">
              Үнэ тарифыг харах →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
