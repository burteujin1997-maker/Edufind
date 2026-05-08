"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl mx-auto gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Сургуулийн нэр хайх..."
          className="w-full rounded-xl border-0 py-3 pl-10 pr-4 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1ea572]"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-[#1ea572] px-6 py-3 font-medium text-white hover:bg-[#25c588] transition-colors shadow-lg"
      >
        Хайх
      </button>
    </form>
  );
}
