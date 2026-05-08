import { getStats, getAllSchoolsAdmin } from "@/lib/schools";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";
import { Building2, CheckCircle, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [stats, schools] = await Promise.all([getStats(), getAllSchoolsAdmin()]);

  const featured = schools.filter((s) => s.is_featured).length;
  const verified = schools.filter((s) => s.is_verified).length;

  const byCategory = Object.entries(CATEGORIES).map(([key, label]) => ({
    key,
    label,
    count: schools.filter((s) => s.category === key).length,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Хяналтын самбар</h1>
        <Link href="/admin/schools/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Байгууллага нэмэх
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        {[
          { label: "Нийт байгууллага", value: stats.total, icon: Building2, color: "bg-blue-50 text-blue-700" },
          { label: "Онцлох", value: featured, icon: Star, color: "bg-amber-50 text-amber-700" },
          { label: "Баталгаажсан", value: verified, icon: CheckCircle, color: "bg-green-50 text-green-700" },
          { label: "Дүүрэг", value: stats.districts, icon: Building2, color: "bg-purple-50 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-[#1a3a5c]">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* By category */}
      <div className="rounded-xl border bg-white p-5 shadow-sm mb-6">
        <h2 className="mb-4 font-semibold text-[#1a3a5c]">Ангиллаар</h2>
        <div className="space-y-3">
          {byCategory.map(({ key, label, count }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{label}</span>
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#1a3a5c]"
                    style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-semibold text-[#1a3a5c]">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-[#1a3a5c]">Сүүлд нэмэгдсэн</h2>
          <Link href="/admin/schools" className="text-sm text-[#1ea572] hover:underline">
            Бүгдийг харах
          </Link>
        </div>
        <div className="divide-y">
          {schools.slice(0, 8).map((school) => (
            <div key={school.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-[#1a3a5c]">{school.name}</p>
                <p className="text-xs text-gray-500">
                  {CATEGORIES[school.category]} · {school.district ?? "—"}
                </p>
              </div>
              <Link
                href={`/admin/schools/${school.id}`}
                className="text-xs text-[#1ea572] hover:underline"
              >
                Засах
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
