'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type RegistrationRequest = {
  id: string
  name: string
  category: string
  district: string
  address: string
  phone: string
  email: string
  website: string | null
  facebook: string | null
  description: string | null
  tier: string
  contact_person: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic ₮99,000',
  standard: 'Standard ₮199,000',
  premium: 'Premium ₮399,000',
}

const CATEGORY_LABELS: Record<string, string> = {
  ebs: 'ЕБС',
  ids: 'Олон улсын сургууль',
  surgalt: 'Сургалтын төв',
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending: { label: 'Хүлээгдэж байна', class: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Зөвшөөрсөн', class: 'bg-green-100 text-green-800' },
  rejected: { label: 'Татгалзсан', class: 'bg-red-100 text-red-800' },
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selected, setSelected] = useState<RegistrationRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    let query = supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query
    if (!error && data) setRequests(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const handleApprove = async (req: RegistrationRequest) => {
    setActionLoading(true)
    const slug = req.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      + '-' + Date.now()

    const { error: insertError } = await supabase.from('schools').insert({
      name: req.name,
      slug,
      category: req.category,
      district: req.district,
      address: req.address,
      phone: req.phone,
      email: req.email,
      website: req.website,
      facebook: req.facebook,
      description: req.description,
      contact_person: req.contact_person,
      tier: req.tier,
      is_approved: true,
      is_verified: false,
      is_featured: false,
    })

    if (insertError) {
      alert('Алдаа гарлаа: ' + insertError.message)
      setActionLoading(false)
      return
    }

    // Байгууллагын ID авах
const { data: schoolData } = await supabase
  .from('schools')
  .select('id')
  .eq('slug', slug)
  .single()

// user_id байвал school_users-д нэмэх
if (schoolData && (req as any).user_id) {
  await supabase.from('school_users').insert({
    user_id: (req as any).user_id,
    school_id: schoolData.id,
  })
}

await supabase
  .from('registration_requests')
  .update({ status: 'approved' })
  .eq('id', req.id)

setActionLoading(false)
setSelected(null)
fetchRequests()
  }

  const handleReject = async (req: RegistrationRequest) => {
    setActionLoading(true)
    await supabase
      .from('registration_requests')
      .update({ status: 'rejected' })
      .eq('id', req.id)

    setActionLoading(false)
    setShowRejectModal(false)
    setRejectNote('')
    setSelected(null)
    fetchRequests()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Бүртгэлийн хүсэлтүүд</h1>
        <p className="text-gray-500 mt-1">Шинэ байгууллагын бүртгэлийн хүсэлтүүдийг харж, зөвшөөрөх эсвэл татгалзах</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'pending' && '⏳ Хүлээгдэж байна'}
            {tab === 'approved' && '✅ Зөвшөөрсөн'}
            {tab === 'rejected' && '❌ Татгалзсан'}
            {tab === 'all' && '📋 Бүгд'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg">Хүсэлт байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Байгууллага</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ангилал</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тариф</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.name}</div>
                    <div className="text-sm text-gray-500">{req.email}</div>
                    <div className="text-sm text-gray-400">{req.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {CATEGORY_LABELS[req.category] || req.category}
                    <div className="text-xs text-gray-400">{req.district}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                      req.tier === 'standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {TIER_LABELS[req.tier] || req.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[req.status]?.class}`}>
                      {STATUS_LABELS[req.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.created_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(req)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Дэлгэрэнгүй →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Ангилал:</span><p className="font-medium">{CATEGORY_LABELS[selected.category] || selected.category}</p></div>
                <div><span className="text-gray-500">Дүүрэг:</span><p className="font-medium">{selected.district}</p></div>
                <div><span className="text-gray-500">Утас:</span><p className="font-medium">{selected.phone}</p></div>
                <div><span className="text-gray-500">Имэйл:</span><p className="font-medium">{selected.email}</p></div>
                <div><span className="text-gray-500">Холбоо барих хүн:</span><p className="font-medium">{selected.contact_person || '—'}</p></div>
                <div><span className="text-gray-500">Тариф:</span><p className="font-medium">{TIER_LABELS[selected.tier] || selected.tier}</p></div>
                {selected.website && (
                  <div><span className="text-gray-500">Вэбсайт:</span>
                    <a href={selected.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">{selected.website}</a>
                  </div>
                )}
                {selected.facebook && (
                  <div><span className="text-gray-500">Facebook:</span>
                    <a href={selected.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">{selected.facebook}</a>
                  </div>
                )}
              </div>

              <div><span className="text-gray-500 text-sm">Хаяг:</span><p className="text-sm font-medium mt-1">{selected.address}</p></div>

              {selected.description && (
                <div><span className="text-gray-500 text-sm">Тайлбар:</span>
                  <p className="text-sm mt-1 text-gray-700 bg-gray-50 rounded-lg p-3">{selected.description}</p>
                </div>
              )}

              <div>
                <span className="text-gray-500 text-sm">Статус:</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[selected.status]?.class}`}>
                  {STATUS_LABELS[selected.status]?.label}
                </span>
              </div>
            </div>

            {selected.status === 'pending' && (
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => handleApprove(selected)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  {actionLoading ? 'Түр хүлээнэ үү...' : '✅ Зөвшөөрөх'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  ❌ Татгалзах
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Татгалзах уу?</h3>
            <p className="text-sm text-gray-500 mb-4"><strong>{selected.name}</strong> байгууллагын хүсэлтийг татгалзах гэж байна.</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Татгалзах шалтгаан (заавал биш)"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowRejectModal(false); setRejectNote('') }} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50">Болих</button>
              <button onClick={() => handleReject(selected)} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium">
                {actionLoading ? 'Түр хүлээнэ үү...' : 'Татгалзах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
