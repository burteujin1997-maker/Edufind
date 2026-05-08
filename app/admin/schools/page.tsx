import { getAllSchoolsAdmin, deleteSchool } from "@/lib/schools";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPriceRange } from "@/lib/utils";
import DeleteButton from "./DeleteButton";
import CsvImport from "./CsvImport";

export default async function AdminSchoolsPage() {
  const schools = await getAllSchoolsAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Байгууллагууд</h1>
        <div className="flex gap-2">
          <CsvImport />
          <Link href="/admin/schools/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Шинэ нэмэх
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Нэр</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Ангилал</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Дүүрэг</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Төлбөр</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Төлөв</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1a3a5c]">{school.name}</p>
                    <p className="text-xs text-gray-400">{school.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        school.category === "ebs"
                          ? "blue"
                          : school.category === "ids"
                          ? "green"
                          : "amber"
                      }
                    >
                      {CATEGORIES[school.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{school.district ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatPriceRange(school.tuition_min, school.tuition_max)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {school.is_featured && (
                        <Badge variant="green" className="text-xs">Онцлох</Badge>
                      )}
                      {school.is_verified && (
                        <Badge variant="default" className="text-xs">Баталгаа</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/schools/${school.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <DeleteButton id={school.id} name={school.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Байгууллага байхгүй байна
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
