'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ExtraOrder = {
  id: string
  service_name: string
  school_name: string
  phone: string
  email: string
  note: string | null
  status: 'pending' | 'contacted' | 'completed' | 'cancelled'
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending: { label: '⏳ Хүлээгдэж байна', class: 'bg-yellow-100 text-yellow-800' },
  contacted: { label: '📞 Холбогдсон', class: 'bg-blue-100 text-blue-800' },
  completed: { label: '✅ Дууссан', class: 'bg-green-100 text-green-800' },
  cancelled: { label: '❌ Цуцлагдсан', class: 'bg-red-100 text-red-800' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ExtraOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    let query = supabase
      .from('extra_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await supabase.from('extra_orders').update({ status }).eq('id', id)
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as any } : o))
    setUpdating(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Нэмэлт захиалгууд</h1>
        <p className="text-gray-500 mt-1">Нэмэлт үйлчилгээний захиалгуудыг удирдах</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['all', 'pending', 'contacted', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'all' && '📋 Бүгд'}
            {tab === 'pending' && '⏳ Хүлээгдэж байна'}
            {tab === 'contacted' && '📞 Холбогдсон'}
            {tab === 'completed' && '✅ Дууссан'}
            {tab === 'cancelled' && '❌ Цуцлагдсан'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-lg">Захиалга байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Байгууллага</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлчилгээ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Огноо</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.school_name}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                    <div className="text-sm text-gray-400">{order.phone}</div>
                    {order.note && (
                      <div className="text-xs text-gray-400 mt-1 italic">"{order.note}"</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{order.service_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[order.status]?.class}`}>
                      {STATUS_LABELS[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="pending">⏳ Хүлээгдэж байна</option>
                      <option value="contacted">📞 Холбогдсон</option>
                      <option value="completed">✅ Дууссан</option>
                      <option value="cancelled">❌ Цуцлагдсан</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
