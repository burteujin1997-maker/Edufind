'use client'

import { useState, useEffect } from 'react'
import { getReviews, addReview, type Review } from '@/lib/reviews'
import { Star } from 'lucide-react'

export default function ReviewSection({ schoolId }: { schoolId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ author_name: '', rating: 5, comment: '' })
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    getReviews(schoolId).then((data) => {
      setReviews(data)
      setLoading(false)
    })
  }, [schoolId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.author_name.trim()) return
    setSubmitting(true)
    try {
      const review = await addReview({ school_id: schoolId, ...form })
      setReviews((prev) => [review, ...prev])
      setForm({ author_name: '', rating: 5, comment: '' })
      setShowForm(false)
    } catch (err) {
      alert('Алдаа гарлаа. Дахин оролдоно уу.')
    }
    setSubmitting(false)
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Үнэлгээ сэтгэгдэл</h2>
          {avgRating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-2xl font-bold text-yellow-500">{avgRating}</span>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({reviews.length} үнэлгээ)</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#16324f] transition-colors"
        >
          {showForm ? 'Болих' : '✍️ Үнэлгээ бичих'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Нэр *</label>
            <input
              type="text"
              required
              value={form.author_name}
              onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
              placeholder="Таны нэр"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Үнэлгээ *</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    s <= (hoverRating || form.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setForm((f) => ({ ...f, rating: s }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Сэтгэгдэл</label>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Энэ сургуулийн талаар бусдад юу хэлэх вэ?"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#1ea572] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#189060] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Илгээж байна...' : 'Илгээх'}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-gray-400">Ачааллаж байна...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Одоогоор үнэлгээ байхгүй байна. Та эхэлж бичнэ үү!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">{r.author_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('mn-MN')}
                </span>
              </div>
              <div className="flex mb-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}