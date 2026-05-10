'use client'

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SponsoredSchool = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  district: string | null
  description: string | null
}

export default function SponsoredBanners() {
  const [schools, setSchools] = useState<SponsoredSchool[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('schools')
        .select('id, name, slug, logo_url, district, description')
        .eq('tier', 'premium')
        .eq('is_featured', true)
        .eq('is_approved', true)
        .limit(2)
      if (data) setSchools(data)
    }
    fetch()
  }, [])

  if (schools.length === 0) return null

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sponsored</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schools.map((school) => (
          <Link key={school.id} href={`/school/${school.slug}`}>
            <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-2xl p-4 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-700 shrink-0 overflow-hidden">
                {school.logo_url ? (
                  <img src={school.logo_url} alt={school.name} className="w-full h-full object-cover" />
                ) : (
                  school.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded-full">👑 Premium</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#1a3a5c] transition-colors truncate">{school.name}</h3>
                {school.district && (
                  <p className="text-xs text-gray-500 mt-0.5">{school.district}</p>
                )}
                {school.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{school.description}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
