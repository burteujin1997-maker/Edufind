'use client'

import Link from "next/link";
import { useState } from "react";
import { Check, Mail, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    name: "Basic",
    price: 99000,
    yearlyPrice: 82500,
    color: "border-gray-200",
    headerColor: "bg-gray-50",
    badge: null,
    features: [
      "Профайл хуудас",
      "Хайлтад харагдах",
      "5 зураг",
      "Сард 1 мэдэгдэл",
      "Facebook / вэбсайт холбоос",
    ],
    notIncluded: [
      "Verified тэмдэглэгээ",
      "Нүүр хуудасны 1-р байр",
      "Push notification",
      "Sponsored баннер",
      "Дэлгэрэнгүй аналитик",
    ],
  },
  {
    name: "Standard",
    price: 199000,
    yearlyPrice: 167000,
    color: "border-blue-400",
    headerColor: "bg-blue-50",
    badge: "Түгээмэл",
    badgeColor: "bg-blue-500",
    features: [
      "Профайл хуудас",
      "Хайлтад харагдах",
      "Зураг хязгааргүй + 1 видео",
      "Сард 3 мэдэгдэл",
      "Facebook / вэбсайт холбоос",
      "Verified тэмдэглэгээ ✓",
      "Сарын статистик",
    ],
    notIncluded: [
      "Нүүр хуудасны 1-р байр",
      "Push notification",
      "Sponsored баннер",
      "Дэлгэрэнгүй аналитик",
    ],
  },
  {
    name: "Premium",
    price: 399000,
    yearlyPrice: 335000,
    color: "border-purple-400",
    headerColor: "bg-purple-50",
    badge: "Шилдэг",
    badgeColor: "bg-purple-600",
    features: [
      "Профайл хуудас",
      "Хайлтад харагдах",
      "Зураг хязгааргүй + видео",
      "Сард мэдэгдэл хязгааргүй",
      "Facebook / вэбсайт холбоос",
      "Verified тэмдэглэгээ ✓",
      "Нүүр хуудасны 1-р байр",
      "Push notification",
      "Сард 2 Sponsored баннер",
      "Дэлгэрэнгүй аналитик",
    ],
    notIncluded: [],
  },
];

const extras = [
  {
    name: "Онцлох зар 7 хоног",
    price: 150000,
    icon: "⭐",
    description: "Хайлтын үр дүнд дээр харагдана",
  },
  {
    name: "Push мэдэгдэл 1 удаа",
    price: 99000,
    icon: "🔔",
    description: "Бүх хэрэглэгчдэд нэг удаа мэдэгдэл илгээнэ",
  },
  {
    name: "Нэмэлт видео",
    price: 50000,
    icon: "🎬",
    description: "Профайлд нэмэлт видео нэмэх",
  },
  {
    name: "Сарын аналитик тайлан",
    price: 30000,
    icon: "📊",
    description: "Дэлгэрэнгүй үзэлт, статистик тайлан",
  },
];

function formatPrice(price: number) {
  return price.toLocaleString("mn-MN") + "₮";
}

export default function PricingPage() {
  const [selectedService, setSelectedService] = useState<typeof extras[0] | null>(null)
  const [form, setForm] = useState({ school_name: '', phone: '', email: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleOrder = async () => {
    if (!form.school_name || !form.phone || !form.email) {
      alert('Байгууллагын нэр, утас, имэйлийг бөглөнө үү!')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('extra_orders').insert({
      service_name: selectedService?.name,
      school_name: form.school_name,
      phone: form.phone,
      email: form.email,
      note: form.note || null,
      status: 'pending',
    })

    setSubmitting(false)
    if (error) {
      alert('Алдаа гарлаа: ' + error.message)
    } else {
      setSuccess(true)
    }
  }

  const closeModal = () => {
    setSelectedService(null)
    setForm({ school_name: '', phone: '', email: '', note: '' })
    setSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1a3a5c] text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Тарифын төлөвлөгөө</h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          Байгууллагаа EduFind.mn-д бүртгүүлж, илүү олон эцэг эх, сурагчдад хүрээрэй
        </p>
        <div className="mt-4 inline-block bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded-full">
          🎉 Жилийн гэрээнд 16% хөнгөлөлт
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-white rounded-2xl border-2 ${plan.color} shadow-sm overflow-hidden flex flex-col`}>
              {plan.badge && (
                <div className={`absolute top-4 right-4 ${plan.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {plan.badge}
                </div>
              )}
              <div className={`${plan.headerColor} px-6 py-6`}>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500 text-sm">/сар</span>
                </div>
                <div className="mt-1 text-sm text-green-600 font-medium">
                  Жилээр: {formatPrice(plan.yearlyPrice)}/сар
                  <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">-16%</span>
                </div>
              </div>
              <div className="px-6 py-6 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <span className="h-4 w-4 shrink-0 mt-0.5 text-center">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pb-6">
                <Link
                  href={`/register?tier=${plan.name.toLowerCase()}`}
                  className={`block text-center py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    plan.name === "Premium" ? "bg-purple-600 hover:bg-purple-700 text-white" :
                    plan.name === "Standard" ? "bg-blue-500 hover:bg-blue-600 text-white" :
                    "bg-[#1a3a5c] hover:bg-[#16324f] text-white"
                  }`}
                >
                  Бүртгүүлэх
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trial offer */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900">🎁 3 сарын туршилт</h3>
          <p className="text-gray-600 mt-1">Дурын тарифт эхний 3 сард <strong>50% хөнгөлөлт</strong> эдлэх боломжтой</p>
          <Link href="/register" className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors">
            Одоо бүртгүүлэх
          </Link>
        </div>

        {/* Extra services */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Нэмэлт үйлчилгээ</h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Захиалах товч дарж мэдээлэл оруулаарай. Бид 1 ажлын өдрийн дотор холбогдоно.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {extras.map((e) => (
              <div key={e.name} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col">
                <div className="text-3xl mb-2">{e.icon}</div>
                <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                <p className="text-xs text-gray-500 mt-1 flex-1">{e.description}</p>
                <p className="text-xl font-bold text-[#1a3a5c] mt-3">{formatPrice(e.price)}</p>
                <button
                  onClick={() => setSelectedService(e)}
                  className="mt-3 block w-full text-center bg-[#1a3a5c] hover:bg-[#16324f] text-white text-sm font-medium py-2 rounded-xl transition-colors"
                >
                  Захиалах
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Холбоо барих */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-[#1a3a5c]" />
            <h3 className="font-bold text-gray-900">Асуух зүйл байна уу?</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Бидэнтэй холбогдоорой. Ажлын өдрүүдэд хариулна.</p>
          <a
            href="mailto:edufind2026@gmail.com"
            className="inline-flex items-center gap-2 bg-[#1ea572] hover:bg-[#25c588] text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            <Mail className="h-4 w-4" />
            edufind2026@gmail.com
          </a>
        </div>
      </div>

      {/* Захиалгын Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">

            {success ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Захиалга илгээгдлээ!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Бид 1 ажлын өдрийн дотор <strong>{form.email}</strong> хаяг руу холбогдоно.
                </p>
                <button
                  onClick={closeModal}
                  className="bg-[#1a3a5c] hover:bg-[#16324f] text-white font-medium px-6 py-2.5 rounded-xl w-full"
                >
                  Хаах
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedService.icon} {selectedService.name}</h3>
                    <p className="text-[#1a3a5c] font-semibold">{formatPrice(selectedService.price)}</p>
                  </div>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллагын нэр *</label>
                    <input
                      value={form.school_name}
                      onChange={(e) => setForm((f) => ({ ...f, school_name: e.target.value }))}
                      placeholder="Байгууллагын нэр"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Утас *</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="99001234"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл *</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="info@school.mn"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Нэмэлт тайлбар</label>
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      placeholder="Нэмэлт мэдээлэл..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 text-sm"
                  >
                    Болих
                  </button>
                  <button
                    onClick={handleOrder}
                    disabled={submitting}
                    className="flex-1 bg-[#1ea572] hover:bg-[#25c588] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {submitting ? 'Илгээж байна...' : '✓ Захиалах'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
