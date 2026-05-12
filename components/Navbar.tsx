"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Нүүр" },
    { href: "/search", label: "Хайх" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
 <img src="/logo.png" alt="EduFind.mn" className="h-12 w-auto" />
</Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#1a3a5c]",
                pathname === l.href ? "text-[#1a3a5c] font-semibold" : "text-gray-600"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="rounded-md border border-[#1a3a5c] px-4 py-2 text-sm font-medium text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-colors"
          >
            Бүртгүүлэх
          </Link>
          <Link
            href="/search"
            className="rounded-md bg-[#1ea572] px-4 py-2 text-sm font-medium text-white hover:bg-[#25c588] transition-colors"
          >
            Сургуулиа олох
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Цэс"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-white px-4 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block py-2 text-sm font-medium",
                pathname === l.href ? "text-[#1a3a5c] font-semibold" : "text-gray-600"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-md border border-[#1a3a5c] px-4 py-2 text-center text-sm font-medium text-[#1a3a5c]"
          >
            Бүртгүүлэх
          </Link>
          <Link
            href="/search"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-md bg-[#1ea572] px-4 py-2 text-center text-sm font-medium text-white"
          >
            Сургуулиа олох
          </Link>
        </div>
      )}
    </header>
  );
}
