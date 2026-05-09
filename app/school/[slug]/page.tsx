'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MapPin, Phone, Mail, Globe, Facebook, CheckCircle, ArrowLeft, Eye, Bell } from 'lucide-react'
import Link from 'next/link'

type School = {
  id: string
  name: string
  slug: string
  category: string
  district: string
  address: string
  phone: string
  email: string
  website: string | null
  facebook: string | null
  description: string | null
  features: string[] | null
  tuition_min: number | null
  tuition_max: number | null
  logo_url: string | null
  images: string[] | null
  is_featured: boolean
  is_verified: boolean
  tier: string
  video_url: string | null
  contact_person: string | null
}

type Announcement = {
  id: string
  title: string
  content: string
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  ebs: 'ЕБС',
  ids: 'Олон улсын сургууль',
  surgalt: 'Сургалтын төв',
}

function formatPrice(price: number) {
  return (price / 1000000).toFixed(1) + ' сая ₮'
}

export default function SchoolProfilePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [viewCount, setViewCount] = useState<number>(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    if (!slug) return
    const fetchSchool = async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setSchool(data)
      setLoading(false)

      // Үзэлт бүртгэх
      await supabase.from('school_views').insert({ school_id: data.id })

      // Нийт үзэлт тоолох
      const { count } = await supabase
        .from('school_views')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', data.id)
      if (count !== null) setViewCount(count)

      // Мэдэгдлүүд авах
      const { data: annData } = await supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .eq('school_id', data.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (annData) setAnnouncements(annData)
    }
    fetchSchool()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3a5c]" />
      </div>
    )
  }

  if (notFound || !school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="text-5xl mb-4">🏫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Байгууллага олдсонгүй</h1>
        <p className="text-gray-500 mb-6">Хайсан байгууллага байхгүй байна.</p>
        <Link href="/search" className="bg-[#1a3a5c] text-white px-6 py-2.5 rounded-xl hover:bg-[#16324f]">
          Хайлт руу буцах
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a5c] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/search" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Хайлт руу буцах
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
              {school.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                school.name.charAt(0)
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{school.name}</h1>
                {school.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Баталгаажсан
                  </span>
                )}
                {school.is_featured && (
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-medium px-2.5 py-1 rounded-full">
                    ★ Онцлох
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap text-blue-200 text-sm">
                <span>{CATEGORY_LABELS[school.category] || school.category}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {school.district}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {viewCount} үзэлт
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main content */}
        <div className="md:col-span-2 space-y-6">

          {/* Мэдэгдлүүд */}
          {announcements.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-[#1ea572]" />
                <h2 className="text-lg font-bold text-gray-900">Мэдэгдлүүд</h2>
              </div>
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="border-l-4 border-[#1ea572] pl-4 py-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{ann.title}</h3>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(ann.created_at).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {school.description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Танилцуулга</h2>
              <p className="text-gray-600 leading-relaxed">{school.description}</p>
            </div>
          )}

          {/* Features */}
          {school.features && school.features.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Онцлог</h2>
              <div className="flex flex-wrap gap-2">
                {school.features.map((f) => (
                  <span key={f} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-100">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {school.images && school.images.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Зурагнууд</h2>
              <div className="grid grid-cols-2 gap-3">
                {school.images.map((img, i) => (
                  <img key={i} src={img} alt={`${school.name} ${i + 1}`} className="rounded-xl object-cover w-full h-40" />
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {school.video_url && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Видео</h2>
              <video src={school.video_url} controls className="w-full rounded-xl" />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Үзэлт статистик */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Статистик</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{viewCount}</p>
                <p className="text-xs text-gray-500">Нийт үзэлт</p>
              </div>
            </div>
          </div>

          {/* Tuition */}
          {(school.tuition_min || school.tuition_max) && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Сургалтын төлбөр</h3>
              <p className="text-xl font-bold text-[#1a3a5c]">
                {school.tuition_min && school.tuition_max
                  ? `${formatPrice(school.tuition_min)} — ${formatPrice(school.tuition_max)}`
                  : school.tuition_min
                  ? formatPrice(school.tuition_min)
                  : formatPrice(school.tuition_max!)}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Холбоо барих</h3>
            {school.address && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span>{school.address}</span>
              </div>
            )}
            {school.phone && (
              <a href={`tel:${school.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1a3a5c]">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                {school.phone}
              </a>
            )}
            {school.email && (
              <a href={`mailto:${school.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1a3a5c]">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                {school.email}
              </a>
            )}
            {school.website && (
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <Globe className="h-4 w-4 shrink-0" />
                Вэбсайт
              </a>
            )}
            {school.facebook && (
              <a href={school.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <Facebook className="h-4 w-4 shrink-0" />
                Facebook
              </a>
            )}
          </div>

          {/* Tier badge */}
          <div className={`rounded-2xl p-4 text-center text-sm font-medium ${
            school.tier === 'premium' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
            school.tier === 'standard' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-gray-50 text-gray-600 border border-gray-200'
          }`}>
            {school.tier === 'premium' ? '👑 Premium гишүүн' :
             school.tier === 'standard' ? '⭐ Standard гишүүн' :
             'Basic гишүүн'}
          </div>
        </div>
      </div>
    </div>
  )
}
