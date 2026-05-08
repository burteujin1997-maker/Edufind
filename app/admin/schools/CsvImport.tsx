"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

export default function CsvImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const res = await fetch("/api/admin/schools/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: results.data }),
        });
        const data = await res.json();
        setMessage(res.ok ? `${data.inserted} байгууллага нэмэгдлээ` : "Алдаа гарлаа");
        setLoading(false);
        if (res.ok) router.refresh();
      },
    });

    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      {message && <span className="text-sm text-green-600">{message}</span>}
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={loading}>
        <Upload className="mr-2 h-4 w-4" />
        {loading ? "Импортлож байна..." : "CSV импорт"}
      </Button>
    </div>
  );
}
