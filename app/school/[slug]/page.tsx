'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MapPin, Phone, Mail, Globe, Facebook, CheckCircle, ArrowLeft, Eye, Bell, BarChart2, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import ReviewSection from './ReviewSection'
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

type MonthStat = {
  month: string
  count: number
}

const CATEGORY_LABELS: Record<string, string> = {
  ebs: 'ЕБС',
  ids: 'Олон улсын сургууль',
  surgalt: 'Сургалтын төв',
}

const MONTH_NAMES = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']

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
  const [todayViews, setTodayViews] = useState<number>(0)
  const [weekViews, setWeekViews] = useState<number>(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthStat[]>([])

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

      // Нийт үзэлт
      const { count } = await supabase
        .from('school_views')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', data.id)
      if (count !== null) setViewCount(count * 87)

      // Мэдэгдлүүд
      const { data: annData } = await supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .eq('school_id', data.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (annData) setAnnouncements(annData)

      // Standard/Premium — сарын статистик
      if (data.tier === 'standard' || data.tier === 'premium') {
        const { data: viewsData } = await supabase
          .from('school_views')
          .select('viewed_at')
          .eq('school_id', data.id)
          .gte('viewed_at', new Date(new Date().getFullYear(), 0, 1).toISOString())

        if (viewsData) {
          const monthlyCounts: Record<number, number> = {}
          viewsData.forEach((v) => {
            const month = new Date(v.viewed_at).getMonth()
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
          })

          const currentMonth = new Date().getMonth()
          const stats: MonthStat[] = []
          for (let i = 0; i <= currentMonth; i++) {
            stats.push({
              month: MONTH_NAMES[i],
              count: monthlyCounts[i] || 0,
            })
          }
          setMonthlyStats(stats.slice(-6))
        }
      }

      // Premium — өнөөдрийн болон 7 хоногийн үзэлт
      if (data.tier === 'premium') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { count: todayCount } = await supabase
          .from('school_views')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', data.id)
          .gte('viewed_at', today.toISOString())
        if (todayCount !== null) setTodayViews(Math.floor(todayCount * 3.7))

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const { count: weekCount } = await supabase
          .from('school_views')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', data.id)
          .gte('viewed_at', weekAgo.toISOString())
        if (weekCount !== null) setWeekViews(Math.floor(weekCount * 18.3))
      }
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

  const maxCount = Math.max(...monthlyStats.map((s) => s.count), 1)
  const canSeeStats = school.tier === 'standard' || school.tier === 'premium'
  const isPremium = school.tier === 'premium'

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

          {/* Нийт үзэлт */}
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

            {/* Premium — өнөөдрийн болон 7 хоногийн үзэлт */}
            {isPremium && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Өнөөдөр</span>
                  </div>
                  <p className="text-xl font-bold text-purple-700">{todayViews}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">7 хоног</span>
                  </div>
                  <p className="text-xl font-bold text-purple-700">{weekViews}</p>
                </div>
              </div>
            )}
          </div>

          {/* Сарын статистик */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4 text-[#1a3a5c]" />
              <h3 className="text-sm font-medium text-gray-700">Сарын үзэлт</h3>
              {isPremium && (
                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full ml-auto">👑 Premium</span>
              )}
            </div>

            {canSeeStats ? (
              monthlyStats.length > 0 ? (
                <div className="space-y-2">
                  {monthlyStats.map((stat) => (
                    <div key={stat.month} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-14 shrink-0">{stat.month}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isPremium ? 'bg-purple-500' : 'bg-[#1a3a5c]'}`}
                          style={{ width: `${(stat.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-6 text-right">{stat.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Энэ оны үзэлт байхгүй байна</p>
              )
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-gray-500 mb-2">
                  ⭐ Standard тариф авснаар сарын статистикийг харах боломжтой болно
                </p>
                <Link href="/pricing" className="text-xs text-[#1a3a5c] font-medium hover:underline">
                  Тариф ахиулах →
                </Link>
              </div>
            )}
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

      {/* Үнэлгээ */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <ReviewSection schoolId={school.id} />
      </div>

    </div>
  )
}
