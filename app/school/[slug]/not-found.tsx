import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Search className="h-16 w-16 text-gray-200 mb-4" />
      <h2 className="text-2xl font-bold text-[#1a3a5c]">Сургууль олдсонгүй</h2>
      <p className="mt-2 text-gray-500">Таны хайсан сургуулийн мэдээлэл байхгүй байна.</p>
      <Link href="/search" className="mt-6">
        <Button>Хайлт руу буцах</Button>
      </Link>
    </div>
  );
}
