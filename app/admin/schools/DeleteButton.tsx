"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "Тийм"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Үгүй
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-500 hover:text-red-700"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
