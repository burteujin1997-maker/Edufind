"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Building2, LogOut, PlusCircle, Bell, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/admin/schools", label: "Байгууллагууд", icon: Building2 },
 { href: "/admin/requests", label: "Бүртгэлийн хүсэлт", icon: PlusCircle },
 { href: "/admin/announcements", label: "Мэдэгдлүүд", icon: Bell },
{ href: "/admin/orders", label: "Захиалгууд", icon: ShoppingBag },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-56 shrink-0 border-r bg-white flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a3a5c]">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a3a5c]">EduFind Admin</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === l.href
                ? "bg-[#1a3a5c] text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Гарах
        </button>
      </div>
    </aside>
  );
}
