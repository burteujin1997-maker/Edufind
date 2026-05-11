'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GraduationCap, Check, FileText, Lock, Eye, EyeOff } from 'lucide-react'

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₮99,000',
    threeMonth: '₮297,000',
    discounted: '₮148,500',
    color: 'border-gray-300',
    activeColor: 'border-[#1a3a5c] bg-[#1a3a5c]/5',
    features: ['Профайл хуудас', 'Хайлтад харагдах', '5 зураг', 'Сард 1 мэдэгдэл'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₮199,000',
    threeMonth: '₮597,000',
    discounted: '₮298,500',
    color: 'border-blue-300',
    activeColor: 'border-blue-500 bg-blue-50',
    badge: 'Түгээмэл',
    features: ['Зураг хязгааргүй + видео', 'Сард 3 мэдэгдэл', 'Verified тэмдэглэгээ', 'Сарын статистик'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₮399,000',
    threeMonth: '₮1,197,000',
    discounted: '₮598,500',
    color: 'border-purple-300',
    activeColor: 'border-purple-500 bg-purple-50',
    badge: 'Шилдэг',
    features: ['Нүүр хуудасны 1-р байр', 'Sponsored баннер', 'Дэлгэрэнгүй аналитик'],
  },
]

const DISTRICTS = [
  'БЗД', 'БГД', 'СБД', 'СХД', 'ХУД', 'ЧД', 'ХБД', 'НД', 'БНД', 'ЗД', 'ГЧД', 'БД', 'Налайх', 'Багануур', 'Багахангай'
]

const CATEGORIES = [
  { id: 'ebs', label: 'Ерөнхий боловсролын сургууль (ЕБС)' },
  { id: 'ids', label: 'Олон улсын сургууль' },
  { id: 'surgalt', label: 'Сургалтын төв' },
]

const TERMS = [
  'Байгууллагын оруулсан бүх мэдээлэл үнэн зөв байна.',
  'Үйлчилгээний төлбөрийг 3 сараар урьдчилан төлнө.',
  'Анх удаа бүртгүүлж байгаа байгууллагад эхний 3 сард 50% хөнгөлөлт үзүүлнэ.',
  'Хуурамч мэдээлэл оруулсан тохиолдолд бүртгэлийг цуцална.',
  'Бүртгэлийг цуцалсан тохиолдолд төлбөр буцаан олгохгүй.',
  'EduFind.mn байгууллагын мэдээллийг платформд байршуулах эрхтэй.',
  'Байгууллага мэдээллээ өөрчлөх хүсэлтийг admin-д илгээж болно.',
]

function RegisterPageInner() {
  const searchParams = useSearchParams()
  const defaultTier = searchParams.get('tier') || 'basic'

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    website: '',
    facebook: '',
    description: '',
    contact_person: '',
    tier: defaultTier,
  })

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))
  const selectedTier = TIERS.find((t) => t.id === form.tier)

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      alert('Үйлчилгээний нөхцөлийг зөвшөөрнө үү!')
      return
    }
    if (form.password.length < 6) {
      alert('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой!')
      return
    }

    setLoading(true)

    // 1. Supabase Auth-д бүртгэл үүсгэх
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      alert('Бүртгэл үүсгэхэд алдаа гарлаа: ' + authError.message)
      setLoading(false)
      return
    }

    // 2. Бүртгэлийн хүсэлт илгээх
    const { error: reqError } = await supabase.from('registration_requests').insert({
      name: form.name,
      category: form.category,
      district: form.district,
      address: form.address,
      phone: form.phone,
      email: form.email,
      website: form.website || null,
      facebook: form.facebook || null,
      description: form.description || null,
      contact_person: form.contact_person || null,
      tier: form.tier,
      status: 'pending',
      user_id: authData.user?.id || null,
    })

    setLoading(false)
    if (reqError) {
      alert('Алдаа гарлаа: ' + reqError.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Амжилттай илгээлээ!</h2>
          <p className="text-gray-500 mb-4">
            Таны бүртгэлийн хүсэлтийг хүлээн авлаа. Бид 1-2 ажлын өдрийн дотор холбогдох болно.
          </p>

          {/* Dashboard мэдээлэл */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left mb-4 text-sm">
            <p className="font-semibold text-green-700 mb-1">🔐 Dashboard нэвтрэх мэдээлэл:</p>
            <p className="text-gray-600">Имэйл: <strong>{form.email}</strong></p>
            <p className="text-gray-500 text-xs mt-1">Admin зөвшөөрсний дараа /dashboard хуудсаар нэвтэрнэ үү</p>
          </div>

          {/* Төлбөрийн мэдээлэл */}
          <div className="bg-blue-50 rounded-xl p-4 text-left mb-6 text-sm">
            <p className="font-semibold text-[#1a3a5c] mb-2">💳 Төлбөрийн мэдээлэл:</p>
            <p className="text-gray-600 mb-1">Сонгосон тариф: <strong className="capitalize">{form.tier}</strong></p>
            <div className="flex justify-between text-gray-600 mb-1">
              <span>3 сарын төлбөр:</span>
              <span className="line-through text-gray-400">{selectedTier?.threeMonth}</span>
            </div>
            <div className="flex justify-between text-green-600 font-bold mb-3">
              <span>🎉 50% хөнгөлөлттэй:</span>
              <span>{selectedTier?.discounted}</span>
            </div>
            <div className="border-t border-blue-100 pt-3 space-y-1">
              <p className="text-gray-700 font-medium">🏦 Хаанбанк</p>
              <p className="text-gray-600">Дансны дугаар: <strong>030005005041392107</strong></p>
              <p className="text-gray-600">Эзэмшигч: <strong>Мэндбаяр Бөртэ-Үжин</strong></p>
              <p className="text-gray-500 text-xs mt-2">* Гүйлгээний утга дээр байгууллагынхаа нэрийг бичнэ үү</p>
            </div>
          </div>

          <a href="/" className="block w-full bg-[#1a3a5c] hover:bg-[#16324f] text-white font-medium py-2.5 rounded-xl transition-colors">
            Нүүр хуудас руу буцах
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a5c] text-white py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">EduFind.mn</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Байгууллага бүртгүүлэх</h1>
        <p className="text-blue-200 mt-2">Мэдээллээ оруулаад admin баталгаажуулахыг хүлээнэ үү</p>
        <div className="mt-3 inline-block bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded-full">
          🎉 Анх удаа бүртгүүлэхэд эхний 3 сард 50% хөнгөлөлт
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? 'bg-[#1a3a5c] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded ${step > s ? 'bg-[#1a3a5c]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">1. Тариф сонгох</h2>
              <p className="text-sm text-gray-500 mb-5">Байгууллагынхаа хэрэгцээнд тохирох тарифыг сонгоно уу</p>
              <div className="space-y-3">
                {TIERS.map((tier) => (
                  <div key={tier.id} onClick={() => update('tier', tier.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${form.tier === tier.id ? tier.activeColor : tier.color + ' hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.tier === tier.id ? 'border-[#1a3a5c] bg-[#1a3a5c]' : 'border-gray-300'}`}>
                          {form.tier === tier.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="font-bold text-gray-900">{tier.name}</span>
                        {tier.badge && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{tier.badge}</span>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1a3a5c]">{tier.price}/сар</p>
                        <p className="text-xs text-gray-400 line-through">{tier.threeMonth}</p>
                        <p className="text-xs text-green-600 font-medium">🎉 {tier.discounted}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {tier.features.map((f) => (<span key={f} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{f}</span>))}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="mt-6 w-full bg-[#1a3a5c] hover:bg-[#16324f] text-white font-medium py-2.5 rounded-xl transition-colors">Үргэлжлүүлэх →</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">2. Байгууллагын мэдээлэл</h2>
              <p className="text-sm text-gray-500 mb-5">Байгууллагынхаа үндсэн мэдээллийг оруулна уу</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллагын нэр *</label>
                  <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Жишээ: Шинэ Монгол ЕБС" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал *</label>
                  <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30">
                    <option value="">Сонгоно уу...</option>
                    {CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дүүрэг *</label>
                  <select value={form.district} onChange={(e) => update('district', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30">
                    <option value="">Сонгоно уу...</option>
                    {DISTRICTS.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хаяг *</label>
                  <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Дэлгэрэнгүй хаяг" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Утас *</label>
                    <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="99001234" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл *</label>
                    <input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="info@school.mn" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                  </div>
                </div>

                {/* Dashboard нууц үг */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-[#1a3a5c]" />
                    <label className="text-sm font-medium text-[#1a3a5c]">Dashboard нууц үг *</label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Байгууллагын dashboard-д нэвтрэхэд ашиглах нууц үг</p>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Хамгийн багадаа 6 тэмдэгт"
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 pr-10 bg-white"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Вэбсайт</label>
                    <input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input value={form.facebook} onChange={(e) => update('facebook', e.target.value)} placeholder="https://facebook.com/..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50">← Буцах</button>
                <button
                  onClick={() => {
                    if (!form.name || !form.category || !form.district || !form.address || !form.phone || !form.email) {
                      alert('Бүх шаардлагатай талбарыг бөглөнө үү!')
                      return
                    }
                    if (!form.password || form.password.length < 6) {
                      alert('Dashboard нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой!')
                      return
                    }
                    setStep(3)
                  }}
                  className="flex-1 bg-[#1a3a5c] hover:bg-[#16324f] text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  Үргэлжлүүлэх →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">3. Нэмэлт мэдээлэл</h2>
              <p className="text-sm text-gray-500 mb-5">Танилцуулга болон гэрээний нөхцөл</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Байгууллагын танилцуулга</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Байгууллагынхаа тухай товч танилцуулга бичнэ үү..." rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Холбоо барих хүн</label>
                  <input value={form.contact_person} onChange={(e) => update('contact_person', e.target.value)} placeholder="Овог нэр" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30" />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                  <p className="font-medium text-gray-700">Хүсэлтийн хураангуй:</p>
                  <div className="flex justify-between text-gray-600"><span>Байгууллага:</span><span className="font-medium">{form.name}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Тариф:</span><span className="font-medium capitalize">{form.tier} — {selectedTier?.price}/сар</span></div>
                  <div className="flex justify-between text-gray-400"><span>3 сарын үнэ:</span><span className="line-through">{selectedTier?.threeMonth}</span></div>
                  <div className="flex justify-between text-green-600 font-bold"><span>🎉 50% хөнгөлөлттэй:</span><span>{selectedTier?.discounted}</span></div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setShowTerms(!showTerms)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#1a3a5c]" />
                      <span className="text-sm font-medium text-gray-900">📄 Үйлчилгээний нөхцөл</span>
                    </div>
                    <span className="text-xs text-gray-400">{showTerms ? '▲ Хаах' : '▼ Харах'}</span>
                  </button>
                  {showTerms && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <ol className="space-y-2 mt-3">
                        {TERMS.map((term, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-[#1a3a5c] font-bold shrink-0">{i + 1}.</span>{term}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1a3a5c] focus:ring-[#1a3a5c]" />
                  <span className="text-sm text-gray-600">
                    Би <button type="button" onClick={() => setShowTerms(true)} className="text-[#1a3a5c] font-medium underline">үйлчилгээний нөхцөл</button>-ийг уншиж, зөвшөөрч байна. Үйлчилгээний төлбөрийг <strong>3 сараар</strong> урьдчилан төлнө.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50">← Буцах</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !agreedToTerms}
                  className="flex-1 bg-[#1ea572] hover:bg-[#25c588] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  {loading ? 'Илгээж байна...' : '✓ Зөвшөөрч хүсэлт илгээх'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  )
}
