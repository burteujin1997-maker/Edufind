'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type School = {
  id: string
  name: string
  slug: string
  category: string
  district: string
  phone: string
  email: string
  tier: string
  is_verified: boolean
  is_featured: boolean
  is_approved: boolean
  created_at: string
}

const TIER_COLORS: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-700',
  standard: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
}

const CATEGORY_LABELS: Record<string, string> = {
  ebs: 'ЕБС',
  ids: 'Олон улсын сургууль',
  surgalt: 'Сургалтын төв',
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<School | null>(null)

  const fetchSchools = async () => {
    setLoading(true)
    let query = supabase
      .from('schools')
      .select('id, name, slug, category, district, phone, email, tier, is_verified, is_featured, is_approved, created_at')
      .order('created_at', { ascending: false })

    if (tierFilter !== 'all') {
      query = query.eq('tier', tierFilter)
    }

    const { data, error } = await query
    if (!error && data) setSchools(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchSchools()
  }, [tierFilter])

  const toggleField = async (school: School, field: 'is_verified' | 'is_featured' | 'is_approved') => {
    setUpdating(school.id + field)
    const newValue = !school[field]
    const { error } = await supabase
      .from('schools')
      .update({ [field]: newValue })
      .eq('id', school.id)

    if (!error) {
      setSchools((prev) =>
        prev.map((s) => (s.id === school.id ? { ...s, [field]: newValue } : s))
      )
    }
    setUpdating(null)
  }

  const handleDelete = async (school: School) => {
    const { error } = await supabase.from('schools').delete().eq('id', school.id)
    if (!error) {
      setSchools((prev) => prev.filter((s) => s.id !== school.id))
    }
    setDeleteConfirm(null)
  }

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Байгууллагууд</h1>
          <p className="text-gray-500 mt-1">Бүртгэлтэй байгууллагуудыг удирдах</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          Нийт: <strong>{schools.length}</strong> байгууллага
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Нэрээр хайх..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">Бүх тариф</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🏫</div>
          <p className="text-lg">Байгууллага олдсонгүй</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Байгууллага</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тариф</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Verified ✓</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Featured ★</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Нийтлэгдсэн</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredSchools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{school.name}</div>
                    <div className="text-sm text-gray-500">
                      {CATEGORY_LABELS[school.category] || school.category} · {school.district}
                    </div>
                    <div className="text-xs text-gray-400">{school.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TIER_COLORS[school.tier] || 'bg-gray-100 text-gray-700'}`}>
                      {school.tier}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleField(school, 'is_verified')}
                      disabled={updating === school.id + 'is_verified'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors text-sm ${
                        school.is_verified ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {updating === school.id + 'is_verified' ? '⟳' : school.is_verified ? '✓' : '○'}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleField(school, 'is_featured')}
                      disabled={updating === school.id + 'is_featured'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors text-sm ${
                        school.is_featured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {updating === school.id + 'is_featured' ? '⟳' : school.is_featured ? '★' : '☆'}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleField(school, 'is_approved')}
                      disabled={updating === school.id + 'is_approved'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors text-sm ${
                        school.is_approved ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {updating === school.id + 'is_approved' ? '⟳' : school.is_approved ? '●' : '○'}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={`/school/${school.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Харах
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(school)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Устгах
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Устгах уу?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{deleteConfirm.name}</strong> байгууллагыг системээс бүрмөсөн устгана. Энэ үйлдлийг буцааж болохгүй.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Болих</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium">Устгах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
