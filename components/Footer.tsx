import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-[#1a3a5c] text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Лого */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <GraduationCap className="h-5 w-5 text-[#1a3a5c]" />
              </div>
              <span className="text-xl font-bold text-white">EduFind</span>
              <span className="text-xl font-bold text-[#1ea572]">.mn</span>
            </Link>
            <p className="mt-3 text-sm text-blue-200">
              Улаанбаатар хотын бүх сургалтын байгууллагыг нэг дороос хайх боломж.
            </p>
          </div>

          {/* Ангилал */}
          <div>
            <h3 className="mb-3 font-semibold">Ангилал</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/search?category=ebs" className="hover:text-white transition-colors">Ерөнхий боловсролын сургууль</Link></li>
              <li><Link href="/search?category=ids" className="hover:text-white transition-colors">Их дээд сургууль</Link></li>
              <li><Link href="/search?category=surgalt" className="hover:text-white transition-colors">Сургалтын байгууллага</Link></li>
            </ul>
          </div>

          {/* Байгууллагуудад */}
          <div>
            <h3 className="mb-3 font-semibold">Байгууллагуудад</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/register" className="hover:text-white transition-colors">Бүртгүүлэх</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Үнэ тариф</Link></li>
              <li><Link href="/register?tier=basic" className="hover:text-white transition-colors">Basic тариф</Link></li>
              <li><Link href="/register?tier=standard" className="hover:text-white transition-colors">Standard тариф</Link></li>
              <li><Link href="/register?tier=premium" className="hover:text-white transition-colors">Premium тариф</Link></li>
            </ul>
          </div>

          {/* Холбоо барих */}
          <div>
            <h3 className="mb-3 font-semibold">Холбоо барих</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <a href="mailto:edufind2026@gmail.com" className="hover:text-white transition-colors">
                  edufind2026@gmail.com
                </a>
              </li>
              <li>
  <a href="tel:+97689033927" className="hover:text-white transition-colors">
    +976 8903 3927
  </a>
</li>
              <li>
               <a href="https://www.facebook.com/profile.php?id=61588755604478" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
  Facebook
</a>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Сургуулиа хайх
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-blue-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-blue-300">
          <p>© 2026 EduFind.mn — Бүх эрх хуулиар хамгаалагдсан</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-white transition-colors">Үнэ тариф</Link>
            <Link href="/register" className="hover:text-white transition-colors">Бүртгүүлэх</Link>
            <Link href="/search" className="hover:text-white transition-colors">Хайлт</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
