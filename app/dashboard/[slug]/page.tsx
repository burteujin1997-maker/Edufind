'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Eye, Bell, BarChart2, LogOut, Settings,
  Phone, Mail, Globe, Facebook, Upload,
  TrendingUp, Calendar, Edit, Check, X,
  Image as ImageIcon, Video, Lock
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
  images: string[] | null
  video_url: string | null
  tier: string
  is_verified: boolean
  is_featured: boolean
  tuition_min: number | null
  tuition_max: number | null
}

type Announcement = { id: string; title: string; content: string; created_at: string }
type MonthStat = { month: string; count: number }
type DayStat = { day: string; count: number }

const MONTH_NAMES = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
  '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']

const TIER_LIMITS: Record<string, { announcements: number; images: number; videos: number }> = {
  basic: { announcements: 1, images: 5, videos: 0 },
  standard: { announcements: 3, images: 999, videos: 1 },
  premium: { announcements: 999, images: 999, videos: 999 },
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
  const [dailyStats, setDailyStats] = useState<DayStat[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'media' | 'settings'>('overview')
  const [newAnn, setNewAnn] = useState({ title: '', content: '' })
  const [addingAnn, setAddingAnn] = useState(false)
  const [annLoading, setAnnLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', email: '', website: '', facebook: '', description: '', address: '', tuition_min: '', tuition_max: '' })
  const [saveLoading, setSaveLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/dashboard'); return }

      const { data: schoolUser } = await supabase.from('school_users').select('school_id').eq('user_id', user.id).single()
      if (!schoolUser) { setUnauthorized(true); setLoading(false); return }

      const { data: schoolData } = await supabase.from('schools').select('*').eq('slug', slug).single()
      if (!schoolData || schoolData.id !== schoolUser.school_id) { setUnauthorized(true); setLoading(false); return }

      setSchool(schoolData)
      setEditForm({
        phone: schoolData.phone || '', email: schoolData.email || '',
        website: schoolData.website || '', facebook: schoolData.facebook || '',
        description: schoolData.description || '', address: schoolData.address || '',
        tuition_min: schoolData.tuition_min ? String(schoolData.tuition_min) : '',
        tuition_max: schoolData.tuition_max ? String(schoolData.tuition_max) : '',
      })
      setLoading(false)

      const { count } = await supabase.from('school_views').select('*', { count: 'exact', head: true }).eq('school_id', schoolData.id)
      if (count !== null) setViewCount(count)

      const { data: annData } = await supabase.from('announcements').select('*').eq('school_id', schoolData.id).order('created_at', { ascending: false })
      if (annData) setAnnouncements(annData)

      if (schoolData.tier === 'standard' || schoolData.tier === 'premium') {
        const { data: viewsData } = await supabase.from('school_views').select('viewed_at').eq('school_id', schoolData.id)
          .gte('viewed_at', new Date(new Date().getFullYear(), 0, 1).toISOString())
        if (viewsData) {
          const monthlyCounts: Record<number, number> = {}
          viewsData.forEach((v) => { const month = new Date(v.viewed_at).getMonth(); monthlyCounts[month] = (monthlyCounts[month] || 0) + 1 })
          const currentMonth = new Date().getMonth()
          const stats: MonthStat[] = []
          for (let i = 0; i <= currentMonth; i++) stats.push({ month: MONTH_NAMES[i], count: monthlyCounts[i] || 0 })
          setMonthlyStats(stats.slice(-6))
        }
      }

      if (schoolData.tier === 'premium') {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const { count: todayCount } = await supabase.from('school_views').select('*', { count: 'exact', head: true }).eq('school_id', schoolData.id).gte('viewed_at', today.toISOString())
        if (todayCount !== null) setTodayViews(todayCount)

        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
        const { count: weekCount } = await supabase.from('school_views').select('*', { count: 'exact', head: true }).eq('school_id', schoolData.id).gte('viewed_at', weekAgo.toISOString())
        if (weekCount !== null) setWeekViews(weekCount)

        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const { data: dailyData } = await supabase.from('school_views').select('viewed_at').eq('school_id', schoolData.id).gte('viewed_at', thirtyDaysAgo.toISOString())
        if (dailyData) {
          const dayCounts: Record<string, number> = {}
          dailyData.forEach((v) => { const day = new Date(v.viewed_at).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }); dayCounts[day] = (dayCounts[day] || 0) + 1 })
          setDailyStats(Object.entries(dayCounts).map(([day, count]) => ({ day, count })).slice(-14))
        }
      }
    }
    init()
  }, [slug])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/dashboard') }

  const handleAddAnnouncement = async () => {
    if (!newAnn.title || !newAnn.content) return
    const limit = TIER_LIMITS[school?.tier || 'basic'].announcements
    const thisMonth = announcements.filter((a) => { const d = new Date(a.created_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length
    if (thisMonth >= limit) { alert(`Таны тариф сард ${limit} мэдэгдэл нэмэх боломжтой.`); return }
    setAnnLoading(true)
    const { data } = await supabase.from('announcements').insert({ school_id: school?.id, title: newAnn.title, content: newAnn.content }).select().single()
    if (data) { setAnnouncements([data, ...announcements]); setNewAnn({ title: '', content: '' }); setAddingAnn(false) }
    setAnnLoading(false)
  }

  const handleDeleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  const handleSaveSettings = async () => {
    setSaveLoading(true)
    const { error } = await supabase.from('schools').update({
      phone: editForm.phone, email: editForm.email, website: editForm.website || null,
      facebook: editForm.facebook || null, description: editForm.description || null,
      address: editForm.address || null,
      tuition_min: editForm.tuition_min ? Number(editForm.tuition_min) : null,
      tuition_max: editForm.tuition_max ? Number(editForm.tuition_max) : null,
    }).eq('id', school?.id)
    setSaveLoading(false)
 if (!error) {
  setSchool((prev) => prev ? {
    ...prev,
    phone: editForm.phone,
    email: editForm.email,
    website: editForm.website || null,
    facebook: editForm.facebook || null,
    description: editForm.description || null,
    address: editForm.address || prev.address,
    tuition_min: editForm.tuition_min ? Number(editForm.tuition_min) : null,
    tuition_max: editForm.tuition_max ? Number(editForm.tuition_max) : null,
  } as School : prev)
  setEditMode(false)
}
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !school) return
    setUploadingLogo(true)
    const path = `logos/${school.id}-${Date.now()}`
    const { error } = await supabase.storage.from('school-images').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('school-images').getPublicUrl(path)
      await supabase.from('schools').update({ logo_url: publicUrl }).eq('id', school.id)
      setSchool((prev) => prev ? { ...prev, logo_url: publicUrl } : prev)
    }
    setUploadingLogo(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !school) return
    const limit = TIER_LIMITS[school.tier].images
    const currentImages = school.images || []
    if (currentImages.length >= limit) { alert(`Таны тариф хамгийн ихдээ ${limit} зураг нэмэх боломжтой.`); return }
    setUploadingImage(true)
    const path = `gallery/${school.id}-${Date.now()}`
    const { error } = await supabase.storage.from('school-images').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('school-images').getPublicUrl(path)
      const newImages = [...currentImages, publicUrl]
      await supabase.from('schools').update({ images: newImages }).eq('id', school.id)
      setSchool((prev) => prev ? { ...prev, images: newImages } : prev)
    }
    setUploadingImage(false)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !school) return
    setUploadingVideo(true)
    const path = `videos/${school.id}-${Date.now()}`
    const { error } = await supabase.storage.from('school-images').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('school-images').getPublicUrl(path)
      await supabase.from('schools').update({ video_url: publicUrl }).eq('id', school.id)
      setSchool((prev) => prev ? { ...prev, video_url: publicUrl } : prev)
    }
    setUploadingVideo(false)
  }

  const handleDeleteImage = async (url: string) => {
    if (!school) return
    const newImages = (school.images || []).filter((img) => img !== url)
    await supabase.from('schools').update({ images: newImages }).eq('id', school.id)
    setSchool((prev) => prev ? { ...prev, images: newImages } : prev)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3a5c]" /></div>

  if (unauthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Эрх байхгүй</h1>
      <p className="text-gray-500 mb-6">Энэ байгууллагын dashboard руу нэвтрэх эрх байхгүй байна.</p>
      <button onClick={handleLogout} className="bg-[#1a3a5c] text-white px-6 py-2.5 rounded-xl">Гарах</button>
    </div>
  )

  const maxCount = Math.max(...monthlyStats.map((s) => s.count), 1)
  const maxDayCount = Math.max(...dailyStats.map((s) => s.count), 1)
  const canSeeStats = school?.tier === 'standard' || school?.tier === 'premium'
  const isPremium = school?.tier === 'premium'
  const tierLimits = TIER_LIMITS[school?.tier || 'basic']
  const currentImages = school?.images || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a5c] text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold overflow-hidden">
              {school?.logo_url ? <img src={school.logo_url} alt={school.name} className="w-full h-full object-cover" /> : school?.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold">{school?.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPremium ? 'bg-purple-400/30 text-purple-100' : school?.tier === 'standard' ? 'bg-blue-400/30 text-blue-100' : 'bg-white/20 text-white/70'}`}>
                  {isPremium ? '👑 Premium' : school?.tier === 'standard' ? '⭐ Standard' : 'Basic'}
                </span>
                {school?.is_verified && <span className="text-xs bg-green-400/30 text-green-100 px-2 py-0.5 rounded-full">✓ Баталгаажсан</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/school/${school?.slug}`} target="_blank" className="text-xs text-blue-200 hover:text-white">Профайл харах →</Link>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-blue-200 hover:text-white"><LogOut className="h-4 w-4" /> Гарах</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { key: 'overview', label: '📊 Аналитик' },
              { key: 'announcements', label: '📢 Мэдэгдлүүд' },
              { key: 'media', label: '🖼️ Медиа' },
              { key: 'settings', label: '⚙️ Тохиргоо' },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${activeTab === tab.key ? 'border-[#1a3a5c] text-[#1a3a5c]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Аналитик */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2"><Eye className="h-4 w-4 text-blue-600" /><span className="text-xs text-gray-500">Нийт үзэлт</span></div>
                <p className="text-2xl font-bold text-gray-900">{viewCount}</p>
              </div>
              {isPremium && <>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-purple-600" /><span className="text-xs text-gray-500">Өнөөдөр</span></div>
                  <p className="text-2xl font-bold text-gray-900">{todayViews}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-purple-600" /><span className="text-xs text-gray-500">7 хоног</span></div>
                  <p className="text-2xl font-bold text-gray-900">{weekViews}</p>
                </div>
              </>}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2"><Bell className="h-4 w-4 text-green-600" /><span className="text-xs text-gray-500">Мэдэгдэл</span></div>
                <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
              </div>
            </div>

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
                          <div className={`h-2.5 rounded-full ${isPremium ? 'bg-purple-500' : 'bg-[#1a3a5c]'}`} style={{ width: `${(stat.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-right">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">Энэ оны үзэлт байхгүй байна</p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">⭐ Standard тариф авснаар сарын статистикийг харах боломжтой болно</p>
                  <Link href="/pricing" className="text-sm text-[#1a3a5c] font-medium hover:underline">Тариф ахиулах →</Link>
                </div>
              )}
            </div>

            {isPremium && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h2 className="font-bold text-gray-900">Өдрийн дэлгэрэнгүй аналитик</h2>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-auto">Сүүлийн 14 хоног</span>
                </div>
                {dailyStats.length > 0 ? (
                  <div className="space-y-2">
                    {dailyStats.map((stat) => (
                      <div key={stat.day} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 shrink-0">{stat.day}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${(stat.count / maxDayCount) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-6 text-right">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">Сүүлийн 14 хоногт үзэлт байхгүй байна</p>}
              </div>
            )}

            {!isPremium && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
                <p className="text-sm text-purple-700 font-medium mb-2">👑 Premium тариф авснаар дэлгэрэнгүй аналитик харах боломжтой</p>
                <p className="text-xs text-purple-500 mb-3">Өдрийн үзэлт, 7 хоногийн үзэлт, 14 хоногийн график</p>
                <Link href="/pricing" className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium inline-block">Тариф ахиулах →</Link>
              </div>
            )}
          </div>
        )}

        {/* Мэдэгдлүүд */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Мэдэгдлүүд</h2>
                <p className="text-sm text-gray-500">Сард {tierLimits.announcements === 999 ? 'хязгааргүй' : tierLimits.announcements} мэдэгдэл нэмэх боломжтой</p>
              </div>
              <button onClick={() => setAddingAnn(true)} className="bg-[#1a3a5c] hover:bg-[#16324f] text-white text-sm font-medium px-4 py-2 rounded-xl">+ Мэдэгдэл нэмэх</button>
            </div>

            {addingAnn && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                <div className="space-y-3">
                  <input value={newAnn.title} onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))} placeholder="Мэдэгдлийн гарчиг" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                  <textarea value={newAnn.content} onChange={(e) => setNewAnn((p) => ({ ...p, content: e.target.value }))} placeholder="Мэдэгдлийн агуулга" rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setAddingAnn(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm">Болих</button>
                  <button onClick={handleAddAnnouncement} disabled={annLoading} className="flex-1 bg-[#1ea572] text-white text-sm font-medium py-2 rounded-xl disabled:opacity-50">
                    {annLoading ? 'Хадгалж байна...' : '✓ Нийтлэх'}
                  </button>
                </div>
              </div>
            )}

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
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Медиа */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">🖼️ Лого</h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {school?.logo_url ? <img src={school.logo_url} alt="logo" className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
                </div>
                <div>
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
                    className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#16324f] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl">
                    <Upload className="h-4 w-4" />{uploadingLogo ? 'Хуулж байна...' : 'Лого солих'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG • Дээд тал 2MB</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">📷 Зурагнууд</h2>
                  <p className="text-sm text-gray-500">{currentImages.length}/{tierLimits.images === 999 ? '∞' : tierLimits.images} зураг</p>
                </div>
                <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {tierLimits.images === 5 && currentImages.length >= 5 ? (
                  <div className="flex items-center gap-1 text-xs text-gray-400"><Lock className="h-3.5 w-3.5" /><span>Standard тариф шаардлагатай</span></div>
                ) : (
                  <button onClick={() => imageRef.current?.click()} disabled={uploadingImage || currentImages.length >= tierLimits.images}
                    className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#16324f] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl">
                    <Upload className="h-4 w-4" />{uploadingImage ? 'Хуулж байна...' : 'Зураг нэмэх'}
                  </button>
                )}
              </div>
              {currentImages.length === 0 ? (
                <div className="text-center py-8 text-gray-300"><ImageIcon className="h-12 w-12 mx-auto mb-2" /><p className="text-sm">Зураг байхгүй байна</p></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`${i + 1}`} className="w-full h-32 object-cover rounded-xl" />
                      <button onClick={() => handleDeleteImage(img)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">🎬 Видео</h2>
                  <p className="text-sm text-gray-500">{tierLimits.videos === 0 ? 'Standard тариф шаардлагатай' : tierLimits.videos === 999 ? 'Хязгааргүй' : `${tierLimits.videos} видео`}</p>
                </div>
                <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                {tierLimits.videos === 0 ? (
                  <Link href="/pricing" className="text-xs text-[#1a3a5c] font-medium hover:underline flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Тариф ахиулах</Link>
                ) : (
                  <button onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
                    className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#16324f] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl">
                    <Upload className="h-4 w-4" />{uploadingVideo ? 'Хуулж байна...' : 'Видео нэмэх'}
                  </button>
                )}
              </div>
              {school?.video_url ? <video src={school.video_url} controls className="w-full rounded-xl max-h-64" /> : (
                <div className="text-center py-8 text-gray-300"><Video className="h-12 w-12 mx-auto mb-2" /><p className="text-sm">Видео байхгүй байна</p></div>
              )}
            </div>
          </div>
        )}

        {/* Тохиргоо */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">Байгууллагын мэдээлэл</h2>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-1 text-sm text-[#1a3a5c] font-medium hover:underline"><Edit className="h-4 w-4" /> Засах</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="text-sm text-gray-500">Болих</button>
                    <button onClick={handleSaveSettings} disabled={saveLoading} className="flex items-center gap-1 text-sm bg-[#1ea572] hover:bg-[#25c588] text-white px-3 py-1.5 rounded-lg">
                      <Check className="h-3.5 w-3.5" />{saveLoading ? 'Хадгалж байна...' : 'Хадгалах'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Утас', field: 'phone', placeholder: '99001234' },
                  { label: 'Имэйл', field: 'email', placeholder: 'info@school.mn' },
                  { label: 'Хаяг', field: 'address', placeholder: 'Дэлгэрэнгүй хаяг' },
                  { label: 'Вэбсайт', field: 'website', placeholder: 'https://...' },
                  { label: 'Facebook', field: 'facebook', placeholder: 'https://facebook.com/...' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    {editMode ? (
                      <input value={editForm[field as keyof typeof editForm]} onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                    ) : <p className="text-sm text-gray-700">{(school as any)?.[field] || '—'}</p>}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Сургалтын төлбөр (доод)</label>
                    {editMode ? <input type="number" value={editForm.tuition_min} onChange={(e) => setEditForm((p) => ({ ...p, tuition_min: e.target.value }))} placeholder="14300000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /> : <p className="text-sm text-gray-700">{school?.tuition_min ? (school.tuition_min / 1000000).toFixed(1) + ' сая ₮' : '—'}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Сургалтын төлбөр (дээд)</label>
                    {editMode ? <input type="number" value={editForm.tuition_max} onChange={(e) => setEditForm((p) => ({ ...p, tuition_max: e.target.value }))} placeholder="22000000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /> : <p className="text-sm text-gray-700">{school?.tuition_max ? (school.tuition_max / 1000000).toFixed(1) + ' сая ₮' : '—'}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Танилцуулга</label>
                  {editMode ? <textarea value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} placeholder="Байгууллагын танилцуулга..." rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none" /> : <p className="text-sm text-gray-700">{school?.description || '—'}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Тарифын мэдээлэл</h3>
              <div className={`rounded-xl p-4 ${isPremium ? 'bg-purple-50 border border-purple-200' : school?.tier === 'standard' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                <p className="font-medium text-gray-900">{isPremium ? '👑 Premium' : school?.tier === 'standard' ? '⭐ Standard' : 'Basic'} тариф</p>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p>📢 Сард {tierLimits.announcements === 999 ? 'хязгааргүй' : tierLimits.announcements} мэдэгдэл</p>
                  <p>🖼️ {tierLimits.images === 999 ? 'Хязгааргүй' : tierLimits.images} зураг</p>
                  <p>🎬 {tierLimits.videos === 0 ? 'Видео байхгүй' : tierLimits.videos === 999 ? 'Хязгааргүй видео' : tierLimits.videos + ' видео'}</p>
                </div>
                <p className="text-sm text-gray-500 mt-3">Асуух зүйл байвал:</p>
                <a href="mailto:edufind2026@gmail.com" className="text-sm text-[#1a3a5c] font-medium hover:underline">edufind2026@gmail.com</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
