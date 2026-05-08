import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-[#1a3a5c] text-white">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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

          <div>
            <h3 className="mb-3 font-semibold">Ангилал</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/search?category=ebs" className="hover:text-white transition-colors">Ерөнхий боловсролын сургууль</Link></li>
              <li><Link href="/search?category=ids" className="hover:text-white transition-colors">Их дээд сургууль</Link></li>
              <li><Link href="/search?category=surgalt" className="hover:text-white transition-colors">Сургалтын байгууллага</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Холбоо барих</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <a href="mailto:info@edufind.mn" className="hover:text-white transition-colors">
                  info@edufind.mn
                </a>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Байгууллага нэмүүлэх
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-blue-800 pt-8 text-center text-sm text-blue-300">
          <p>© 2025 EduFind.mn — Бүх эрх хуулиар хамгаалагдсан</p>
        </div>
      </div>
    </footer>
  );
}
