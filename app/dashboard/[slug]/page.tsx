'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Eye, Bell, BarChart2, LogOut, Settings,
  Phone, Mail, Globe, Facebook, MapPin,
  TrendingUp, Calendar, Edit, Check, X
} from 'lucide-react'
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
  logo_url: string | null
  tier: string
  is_verified: boolean
  is_featured: boolean
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

const MONTH_NAMES = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']

const TIER_LIMITS: Record<string, number> = {
  basic: 1,
  standard: 3,
  premium: 999,
}

export default function SchoolDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [todayViews, setTodayViews] = useState(0)
  const [weekViews, setWeekViews] = useState(0)
  const [monthlyStats, setMonthlyStats] = useState<MonthStat[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'settings'>('overview')

  // Мэдэгдэл нэмэх
  const [newAnn, setNewAnn] = useState({ title: '', content: '' })
  const [addingAnn, setAddingAnn] = useState(false)
  const [annLoading, setAnnLoading] = useState(false)

  // Мэдээлэл засах
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', email: '', website: '', facebook: '', description: '' })
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/dashboard')
        return
      }

      // Байгууллагатай холбоотой эсэхийг шалгах
      const { data: schoolUser } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', user.id)
        .single()

      if (!schoolUser) {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      // Байгууллагын мэдээлэл авах
      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!schoolData || schoolData.id !== schoolUser.school_id) {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      setSchool(schoolData)
      setEditForm({
        phone: schoolData.phone || '',
        email: schoolData.email || '',
        website: schoolData.website || '',
        facebook: schoolData.facebook || '',
        description: schoolData.description || '',
      })
      setLoading(false)

      // Нийт үзэлт
      const { count } = await supabase
        .from('school_views')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolData.id)
      if (count !== null) setViewCount(count)

      // Мэдэгдлүүд
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .eq('school_id', schoolData.id)
        .order('created_at', { ascending: false })
      if (annData) setAnnouncements(annData)

      // Standard/Premium — сарын статистик
      if (schoolData.tier === 'standard' || schoolData.tier === 'premium') {
        const { data: viewsData } = await supabase
          .from('school_views')
          .select('viewed_at')
          .eq('school_id', schoolData.id)
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
            stats.push({ month: MONTH_NAMES[i], count: monthlyCounts[i] || 0 })
          }
          setMonthlyStats(stats.slice(-6))
        }
      }

      // Premium — өнөөдөр, 7 хоног
      if (schoolData.tier === 'premium') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: todayCount } = await supabase
          .from('school_views')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolData.id)
          .gte('viewed_at', today.toISOString())
        if (todayCount !== null) setTodayViews(todayCount)

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { count: weekCount } = await supabase
          .from('school_views')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolData.id)
          .gte('viewed_at', weekAgo.toISOString())
        if (weekCount !== null) setWeekViews(weekCount)
      }
    }

    init()
  }, [slug])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/dashboard')
  }

  const handleAddAnnouncement = async () => {
    if (!newAnn.title || !newAnn.content) return
    const limit = TIER_LIMITS[school?.tier || 'basic']
    const thisMonth = announcements.filter((a) => {
      const d = new Date(a.created_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    if (thisMonth >= limit) {
      alert(`Таны тариф сард ${limit} мэдэгдэл нэмэх боломжтой. Тариф ахиулна уу.`)
      return
    }

    setAnnLoading(true)
    const { data } = await supabase
      .from('announcements')
      .insert({ school_id: school?.id, title: newAnn.title, content: newAnn.content })
      .select()
      .single()

    if (data) {
      setAnnouncements([data, ...announcements])
      setNewAnn({ title: '', content: '' })
      setAddingAnn(false)
    }
    setAnnLoading(false)
  }

  const handleDeleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  const handleSaveSettings = async () => {
    setSaveLoading(true)
    const { error } = await supabase
      .from('schools')
      .update({
        phone: editForm.phone,
        email: editForm.email,
        website: editForm.website || null,
        facebook: editForm.facebook || null,
        description: editForm.description || null,
      })
      .eq('id', school?.id)

    setSaveLoading(false)
    if (!error) {
      setSchool((prev) => prev ? { ...prev, ...editForm } : prev)
      setEditMode(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3a5c]" />
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Эрх байхгүй</h1>
        <p className="text-gray-500 mb-6">Энэ байгууллагын dashboard руу нэвтрэх эрх байхгүй байна.</p>
        <button onClick={handleLogout} className="bg-[#1a3a5c] text-white px-6 py-2.5 rounded-xl">
          Гарах
        </button>
      </div>
    )
  }

  const maxCount = Math.max(...monthlyStats.map((s) => s.count), 1)
  const canSeeStats = school?.tier === 'standard' || school?.tier === 'premium'
  const isPremium = school?.tier === 'premium'
  const annLimit = TIER_LIMITS[school?.tier || 'basic']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a5c] text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
              {school?.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                school?.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="font-bold">{school?.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isPremium ? 'bg-purple-400/30 text-purple-100' :
                  school?.tier === 'standard' ? 'bg-blue-400/30 text-blue-100' :
                  'bg-white/20 text-white/70'
                }`}>
                  {isPremium ? '👑 Premium' : school?.tier === 'standard' ? '⭐ Standard' : 'Basic'}
                </span>
                {school?.is_verified && (
                  <span className="text-xs bg-green-400/30 text-green-100 px-2 py-0.5 rounded-full">✓ Баталгаажсан</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/school/${school?.slug}`} target="_blank" className="text-xs text-blue-200 hover:text-white">
              Профайл харах →
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-blue-200 hover:text-white">
              <LogOut className="h-4 w-4" />
              Гарах
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-6">
            {[
              { key: 'overview', label: '📊 Үзэгдэл', icon: BarChart2 },
              { key: 'announcements', label: '📢 Мэдэгдлүүд', icon: Bell },
              { key: 'settings', label: '⚙️ Тохиргоо', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#1a3a5c] text-[#1a3a5c]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Нийт үзэлт</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{viewCount}</p>
              </div>

              {isPremium && (
                <>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-gray-500">Өнөөдөр</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{todayViews}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-gray-500">7 хоног</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{weekViews}</p>
                  </div>
                </>
              )}

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-500">Мэдэгдэл</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
              </div>
            </div>

            {/* Сарын статистик */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-5 w-5 text-[#1a3a5c]" />
                <h2 className="font-bold text-gray-900">Сарын үзэлт</h2>
                {isPremium && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-auto">👑 Premium</span>}
              </div>

              {canSeeStats ? (
                monthlyStats.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyStats.map((stat) => (
                      <div key={stat.month} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-16 shrink-0">{stat.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${isPremium ? 'bg-purple-500' : 'bg-[#1a3a5c]'}`}
                            style={{ width: `${(stat.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-right">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Энэ оны үзэлт байхгүй байна</p>
                )
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">⭐ Standard тариф авснаар сарын статистикийг харах боломжтой болно</p>
                  <Link href="/pricing" className="text-sm text-[#1a3a5c] font-medium hover:underline">Тариф ахиулах →</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Мэдэгдлүүд</h2>
                <p className="text-sm text-gray-500">Сард {annLimit === 999 ? 'хязгааргүй' : annLimit} мэдэгдэл нэмэх боломжтой</p>
              </div>
              <button
                onClick={() => setAddingAnn(true)}
                className="bg-[#1a3a5c] hover:bg-[#16324f] text-white text-sm font-medium px-4 py-2 rounded-xl"
              >
                + Мэдэгдэл нэмэх
              </button>
            </div>

            {/* Шинэ мэдэгдэл нэмэх */}
            {addingAnn && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                <h3 className="font-medium text-gray-900 mb-4">Шинэ мэдэгдэл</h3>
                <div className="space-y-3">
                  <input
                    value={newAnn.title}
                    onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Мэдэгдлийн гарчиг"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                  />
                  <textarea
                    value={newAnn.content}
                    onChange={(e) => setNewAnn((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Мэдэгдлийн агуулга"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setAddingAnn(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50">Болих</button>
                  <button
                    onClick={handleAddAnnouncement}
                    disabled={annLoading}
                    className="flex-1 bg-[#1ea572] hover:bg-[#25c588] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-xl"
                  >
                    {annLoading ? 'Хадгалж байна...' : '✓ Нийтлэх'}
                  </button>
                </div>
              </div>
            )}

            {/* Мэдэгдлийн жагсаалт */}
            {announcements.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-400">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Мэдэгдэл байхгүй байна</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(ann.created_at).toLocaleDateString('mn-MN')}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-red-400 hover:text-red-600 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Байгууллагын мэдээлэл</h2>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-1 text-sm text-[#1a3a5c] font-medium hover:underline">
                  <Edit className="h-4 w-4" /> Засах
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="text-sm text-gray-500 hover:text-gray-700">Болих</button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveLoading}
                    className="flex items-center gap-1 text-sm bg-[#1ea572] hover:bg-[#25c588] text-white px-3 py-1.5 rounded-lg"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saveLoading ? 'Хадгалж байна...' : 'Хадгалах'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: 'Утас', field: 'phone', icon: Phone, placeholder: '99001234' },
                { label: 'Имэйл', field: 'email', icon: Mail, placeholder: 'info@school.mn' },
                { label: 'Вэбсайт', field: 'website', icon: Globe, placeholder: 'https://...' },
                { label: 'Facebook', field: 'facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
              ].map(({ label, field, icon: Icon, placeholder }) => (
                <div key={field} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    {editMode ? (
                      <input
                        value={editForm[field as keyof typeof editForm]}
                        onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{(school as any)?.[field] || '—'}</p>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Танилцуулга</label>
                {editMode ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Байгууллагын танилцуулга..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none"
                  />
                ) : (
                  <p className="text-sm text-gray-700">{school?.description || '—'}</p>
                )}
              </div>
            </div>

            {/* Тарифын мэдээлэл */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">Тарифын мэдээлэл</h3>
              <div className={`rounded-xl p-4 ${
                isPremium ? 'bg-purple-50 border border-purple-200' :
                school?.tier === 'standard' ? 'bg-blue-50 border border-blue-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <p className="font-medium text-gray-900">
                  {isPremium ? '👑 Premium' : school?.tier === 'standard' ? '⭐ Standard' : 'Basic'} тариф
                </p>
                <p className="text-sm text-gray-500 mt-1">Тариф ахиулах болон асуух зүйл байвал:</p>
                <a href="mailto:edufind2026@gmail.com" className="text-sm text-[#1a3a5c] font-medium hover:underline">
                  edufind2026@gmail.com
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
