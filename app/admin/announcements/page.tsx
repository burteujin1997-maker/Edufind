'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type School = {
  id: string
  name: string
}

type Announcement = {
  id: string
  school_id: string
  title: string
  content: string
  created_at: string
  schools?: { name: string }
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    school_id: '',
    title: '',
    content: '',
  })

  const fetchData = async () => {
    setLoading(true)

    const { data: ann } = await supabase
      .from('announcements')
      .select('*, schools(name)')
      .order('created_at', { ascending: false })

    const { data: sch } = await supabase
      .from('schools')
      .select('id, name')
      .eq('is_approved', true)
      .order('name')

    if (ann) setAnnouncements(ann)
    if (sch) setSchools(sch)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!form.school_id || !form.title || !form.content) {
      alert('Бүх талбарыг бөглөнө үү!')
      return
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мэдэгдлүүд</h1>
          <p className="text-gray-500 mt-1">Байгууллагуудын мэдэгдлийг удирдах</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1a3a5c] hover:bg-[#16324f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? '✕ Хаах' : '+ Шинэ мэдэгдэл'}
        </button>
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
                onChange={(e) => setForm((f) => ({ ...f, school_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
              >
                <option value="">Сонгоно уу...</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
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
                disabled={submitting}
                className="bg-[#1ea572] hover:bg-[#25c588] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? 'Нийтлэж байна...' : '✓ Нийтлэх'}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm({ school_id: '', title: '', content: '' }) }}
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
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Болих
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
