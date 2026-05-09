'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type School = {
  id: string
  name: string
  tier: string
}

type Announcement = {
  id: string
  school_id: string
  title: string
  content: string
  created_at: string
  schools?: { name: string; tier: string }
}

const TIER_LIMITS: Record<string, number> = {
  basic: 1,
  standard: 3,
  premium: Infinity,
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic (сард 1)',
  standard: 'Standard (сард 3)',
  premium: 'Premium (хязгааргүй)',
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [limitWarning, setLimitWarning] = useState('')

  const [form, setForm] = useState({
    school_id: '',
    title: '',
    content: '',
  })

  const fetchData = async () => {
    setLoading(true)

    const { data: ann } = await supabase
      .from('announcements')
      .select('*, schools(name, tier)')
      .order('created_at', { ascending: false })

    const { data: sch } = await supabase
      .from('schools')
      .select('id, name, tier')
      .eq('is_approved', true)
      .order('name')

    if (ann) setAnnouncements(ann)
    if (sch) setSchools(sch)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Байгууллага сонгоход хязгаарыг шалгах
  const handleSchoolChange = async (schoolId: string) => {
    setForm((f) => ({ ...f, school_id: schoolId }))
    setLimitWarning('')

    if (!schoolId) return

    const school = schools.find((s) => s.id === schoolId)
    if (!school) return

    const tier = school.tier || 'basic'
    const limit = TIER_LIMITS[tier] ?? 1

    if (limit === Infinity) return

    // Энэ сарын мэдэгдэл тоог шалгах
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { count } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)

    const used = count || 0

    if (used >= limit) {
      setLimitWarning(`⚠️ Энэ байгууллага энэ сард ${used}/${limit} мэдэгдэл нийтэлсэн байна. Хязгаарт хүрсэн!`)
    } else {
      setLimitWarning(`ℹ️ Энэ сард ${used}/${limit} мэдэгдэл нийтэлсэн байна.`)
    }
  }

  const handleSubmit = async () => {
    if (!form.school_id || !form.title || !form.content) {
      alert('Бүх талбарыг бөглөнө үү!')
      return
    }

    // Хязгаар шалгах
    const school = schools.find((s) => s.id === form.school_id)
    const tier = school?.tier || 'basic'
    const limit = TIER_LIMITS[tier] ?? 1

    if (limit !== Infinity) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { count } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', form.school_id)
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)

      if ((count || 0) >= limit) {
        alert(`Энэ байгууллага энэ сард ${limit} мэдэгдлийн хязгаарт хүрсэн байна!\n\nИлүү олон мэдэгдэл нийтлэхийн тулд тариф ахиулах шаардлагатай.`)
        return
      }
    }

    setSubmitting(true)
    const { error } = await supabase.from('announcements').insert({
      school_id: form.school_id,
      title: form.title,
      content: form.content,
    })

    if (error) {
      alert('Алдаа гарлаа: ' + error.message)
    } else {
      setForm({ school_id: '', title: '', content: '' })
      setLimitWarning('')
      setShowForm(false)
      fetchData()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setDeleteId(null)
    fetchData()
  }

  const isLimitReached = limitWarning.startsWith('⚠️')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мэдэгдлүүд</h1>
          <p className="text-gray-500 mt-1">Байгууллагуудын мэдэгдлийг удирдах</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setLimitWarning('') }}
          className="bg-[#1a3a5c] hover:bg-[#16324f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Хаах' : '+ Шинэ мэдэгдэл'}
        </button>
      </div>

      {/* Тарифын хязгаар мэдээлэл */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <p className="font-medium mb-1">📋 Тарифын мэдэгдлийн хязгаар:</p>
        <div className="flex gap-4 flex-wrap">
          <span>Basic: сард <strong>1</strong></span>
          <span>Standard: сард <strong>3</strong></span>
          <span>Premium: <strong>хязгааргүй</strong></span>
        </div>
      </div>

      {/* Шинэ мэдэгдэл form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Шинэ мэдэгдэл нэмэх</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллага *</label>
              <select
                value={form.school_id}
                onChange={(e) => handleSchoolChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
              >
                <option value="">Сонгоно уу...</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {TIER_LABELS[s.tier] || s.tier}
                  </option>
                ))}
              </select>

              {/* Хязгаарын мэдэгдэл */}
              {limitWarning && (
                <div className={`mt-2 text-sm px-3 py-2 rounded-lg ${
                  isLimitReached
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-green-50 text-green-600 border border-green-200'
                }`}>
                  {limitWarning}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Гарчиг *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Мэдэгдлийн гарчиг"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Агуулга *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Мэдэгдлийн агуулга..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || isLimitReached}
                className="bg-[#1ea572] hover:bg-[#25c588] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? 'Нийтлэж байна...' : '✓ Нийтлэх'}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm({ school_id: '', title: '', content: '' }); setLimitWarning('') }}
                className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Болих
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Мэдэгдлүүдийн жагсаалт */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📢</div>
          <p className="text-lg">Мэдэгдэл байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {ann.schools?.name || 'Тодорхойгүй'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ann.schools?.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                      ann.schools?.tier === 'standard' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ann.schools?.tier || 'basic'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ann.created_at).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{ann.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{ann.content}</p>
                </div>
                <button
                  onClick={() => setDeleteId(ann.id)}
                  className="text-red-400 hover:text-red-600 text-sm shrink-0"
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Устгах баталгаажуулалт */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Устгах уу?</h3>
            <p className="text-sm text-gray-500 mb-6">Энэ мэдэгдлийг бүрмөсөн устгана.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Болих</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium">Устгах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
