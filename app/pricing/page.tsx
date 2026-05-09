import Link from "next/link";
import { Check } from "lucide-react";

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
  { name: "Онцлох зар 7 хоног", price: 150000 },
  { name: "Push мэдэгдэл 1 удаа", price: 99000 },
  { name: "Нэмэлт видео", price: 50000 },
  { name: "Сарын аналитик тайлан", price: 30000 },
];

function formatPrice(price: number) {
  return price.toLocaleString("mn-MN") + "₮";
}

export default function PricingPage() {
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

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 ${plan.color} shadow-sm overflow-hidden flex flex-col`}
            >
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
                    plan.name === "Premium"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : plan.name === "Standard"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-[#1a3a5c] hover:bg-[#16324f] text-white"
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
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Нэмэлт үйлчилгээ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {extras.map((e) => (
              <div key={e.name} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                <p className="text-sm text-gray-600">{e.name}</p>
                <p className="text-xl font-bold text-[#1a3a5c] mt-2">{formatPrice(e.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Асуух зүйл байвал: <a href="mailto:edufind2026@gmail.com" className="text-blue-600 hover:underline">edufind2026@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
