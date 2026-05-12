import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export const metadata: Metadata = {
  title: "EduFind.mn — Улаанбаатарын сургалтын байгууллагын лавлах",
  description: "Улаанбаатар хотын ЕБС, их дээд сургууль, сургалтын байгууллагыг нэг дороос хайж олоорой.",
  keywords: "сургууль, улаанбаатар, ЕБС, их дээд, сургалт, хайлт",
  verification: {
  google: "WzDOcbSDcZ0QHAsPqZxV000qqui1BF-FPFImRFogsuA",
},
  openGraph: {
    title: "EduFind.mn",
    description: "Улаанбаатарын сургалтын байгууллагын лавлах",
    locale: "mn_MN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
