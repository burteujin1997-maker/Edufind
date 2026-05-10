export const metadata: Metadata = {
  title: "EduFind.mn — Улаанбаатарын сургалтын байгууллагын лавлах",
  description: "...",
  verification: {
    google: "-r21jJF0FH3stx6Qu615r2I5Ab-gWRI6YAUY7A6AtGA",
  },
    "Улаанбаатар хотын ЕБС, их дээд сургууль, сургалтын байгууллагыг нэг дороос хайж олоорой.",
  keywords: "сургууль, улаанбаатар, ЕБС, их дээд, сургалт, хайлт",
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
