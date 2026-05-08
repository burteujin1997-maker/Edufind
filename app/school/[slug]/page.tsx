import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  DollarSign,
  Share2,
} from "lucide-react";
import { getSchoolBySlug } from "@/lib/schools";
import { CATEGORIES } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceRange } from "@/lib/utils";
import ContactModal from "./ContactModal";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = await getSchoolBySlug(params.slug);
  if (!school) return { title: "Олдсонгүй" };
  return {
    title: `${school.name} — EduFind.mn`,
    description: school.description ?? `${school.name} сургуулийн мэдээлэл`,
  };
}

const CATEGORY_COLOR: Record<string, string> = {
  ebs: "blue",
  ids: "green",
  surgalt: "amber",
};

export default async function SchoolDetailPage({ params }: Props) {
  const school = await getSchoolBySlug(params.slug);
  if (!school) notFound();

  const websiteHref = school.website
    ? school.website.startsWith("http")
      ? school.website
      : `https://${school.website}`
    : null;

  const facebookHref = school.facebook
    ? school.facebook.startsWith("http")
      ? school.facebook
      : `https://${school.facebook}`
    : null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back */}
      <Link
        href="/search"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Хайлт руу буцах
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {/* Top banner */}
        <div className="h-24 bg-gradient-to-r from-[#1a3a5c] to-[#2a5a8c]" />

        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white bg-white shadow-md text-3xl font-bold text-[#1a3a5c]">
              {school.name.charAt(0)}
            </div>
            <div className="flex gap-2 mt-4">
              {school.is_featured && <Badge variant="green">Онцлох</Badge>}
              {school.is_verified && (
                <Badge variant="default" className="flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> Баталгаажсан
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a5c] md:text-3xl">{school.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={CATEGORY_COLOR[school.category] as "blue" | "green" | "amber"}>
                  {CATEGORIES[school.category]}
                </Badge>
                {school.subcategory && (
                  <Badge variant="outline">{school.subcategory}</Badge>
                )}
                {school.district && (
                  <Badge variant="outline">
                    <MapPin className="mr-1 h-3 w-3" />
                    {school.district}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <ContactModal schoolName={school.name} phone={school.phone} email={school.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          {school.description && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-[#1a3a5c]">
                <BookOpen className="h-4 w-4" /> Сургуулийн тухай
              </h2>
              <p className="text-sm leading-relaxed text-gray-700">{school.description}</p>
            </div>
          )}

          {/* Features */}
          {school.features && school.features.length > 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-[#1a3a5c]">Сургалтын онцлог</h2>
              <div className="flex flex-wrap gap-2">
                {school.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-[#1a3a5c]/20 bg-[#1a3a5c]/5 px-3 py-1 text-sm text-[#1a3a5c]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tuition */}
          {(school.tuition_min || school.tuition_max) && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-[#1a3a5c]">
                <DollarSign className="h-4 w-4" /> Жилийн төлбөр
              </h2>
              <p className="text-2xl font-bold text-[#1ea572]">
                {formatPriceRange(school.tuition_min, school.tuition_max)}
              </p>
              <p className="mt-1 text-xs text-gray-400">* Дээрх үнэ жилийн сургалтын төлбөр</p>
            </div>
          )}

          {/* Map */}
          {school.address && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-[#1a3a5c]">
                <MapPin className="h-4 w-4" /> Байршил
              </h2>
              <p className="mb-3 text-sm text-gray-700">{school.address}</p>
              <div className="overflow-hidden rounded-lg border h-48 bg-gray-100">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(school.address)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#1a3a5c]">Холбоо барих</h2>
            <div className="space-y-3">
              {school.phone && (
                <a
                  href={`tel:${school.phone}`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#1a3a5c] transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>{school.phone}</span>
                </a>
              )}
              {school.email && (
                <a
                  href={`mailto:${school.email}`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#1a3a5c] transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="break-all">{school.email}</span>
                </a>
              )}
              {websiteHref && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#1a3a5c] transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="break-all">{school.website}</span>
                </a>
              )}
              {facebookHref && (
                <a
                  href={facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#1a3a5c] transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Facebook className="h-4 w-4" />
                  </div>
                  <span>Facebook хуудас</span>
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {school.phone && (
              <a href={`tel:${school.phone}`} className="block">
                <Button className="w-full" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Залгах: {school.phone}
                </Button>
              </a>
            )}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  Вэбсайт нээх
                </Button>
              </a>
            )}
          </div>

          {/* Suggest correction */}
          <div className="rounded-xl border border-dashed p-4 text-center">
            <p className="text-xs text-gray-500">Мэдээлэл буруу байна уу?</p>
            <a
              href={`mailto:info@edufind.mn?subject=Засвар: ${school.name}&body=Засах мэдээлэл:%0A`}
              className="mt-1 text-xs font-medium text-[#1ea572] hover:underline"
            >
              Засуулах хүсэлт илгээх
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
