import Link from "next/link";
import { MapPin, Phone, BadgeCheck, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type School } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";

const CATEGORY_VARIANT: Record<string, "default" | "green" | "blue" | "amber" | "purple"> = {
  ebs: "blue",
  ids: "green",
  surgalt: "amber",
};

interface SchoolCardProps {
  school: School;
  view?: "grid" | "list";
}

export default function SchoolCard({ school, view = "grid" }: SchoolCardProps) {
  const variant = CATEGORY_VARIANT[school.category] ?? "default";

  if (view === "list") {
    return (
      <Link href={`/school/${school.slug}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl font-bold text-[#1a3a5c]">
              {school.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1a3a5c] truncate">{school.name}</h3>
                    {school.is_verified && (
                      <BadgeCheck className="h-4 w-4 text-[#1ea572] shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant={variant}>{CATEGORIES[school.category]}</Badge>
                    {school.district && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="mr-1 h-3 w-3" />{school.district}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#1ea572]">
                    {formatPriceRange(school.tuition_min, school.tuition_max)}
                  </p>
                </div>
              </div>
              {school.features && school.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {school.features.slice(0, 3).map((f) => (
                    <span key={f} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {f}
                    </span>
                  ))}
                  {school.features.length > 3 && (
                    <span className="text-xs text-gray-400">+{school.features.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/school/${school.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a3a5c]/10 text-xl font-bold text-[#1a3a5c]">
              {school.name.charAt(0)}
            </div>
            {school.is_featured && (
              <Badge variant="green" className="text-xs">Онцлох</Badge>
            )}
          </div>

          <div className="mt-3 flex items-center gap-1">
            <h3 className="font-semibold text-[#1a3a5c] group-hover:text-[#2a5a8c] transition-colors line-clamp-2">
              {school.name}
            </h3>
            {school.is_verified && (
              <BadgeCheck className="h-4 w-4 text-[#1ea572] shrink-0" />
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant={variant}>{CATEGORIES[school.category]}</Badge>
            {school.district && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />{school.district}
              </Badge>
            )}
          </div>

          {school.features && school.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {school.features.slice(0, 4).map((f) => (
                <span key={f} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {f}
                </span>
              ))}
              {school.features.length > 4 && (
                <span className="text-xs text-gray-400 self-center">+{school.features.length - 4}</span>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 space-y-1.5 border-t mt-4">
            {school.phone && (
              <a
                href={`tel:${school.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a3a5c] transition-colors"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {school.phone}
              </a>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1ea572]">
                {formatPriceRange(school.tuition_min, school.tuition_max)}
              </p>
              {school.website && (
                <a
                  href={school.website.startsWith("http") ? school.website : `https://${school.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-[#1a3a5c] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
