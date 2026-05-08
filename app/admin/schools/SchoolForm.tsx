"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, DISTRICTS, type School, type Category } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface Props {
  school?: School;
}

export default function SchoolForm({ school }: Props) {
  const router = useRouter();
  const isEdit = !!school;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: school?.name ?? "",
    slug: school?.slug ?? "",
    category: school?.category ?? ("ebs" as Category),
    subcategory: school?.subcategory ?? "",
    district: school?.district ?? "",
    address: school?.address ?? "",
    phone: school?.phone ?? "",
    email: school?.email ?? "",
    website: school?.website ?? "",
    facebook: school?.facebook ?? "",
    description: school?.description ?? "",
    features: school?.features?.join(", ") ?? "",
    tuition_min: school?.tuition_min?.toString() ?? "",
    tuition_max: school?.tuition_max?.toString() ?? "",
    logo_url: school?.logo_url ?? "",
    is_featured: school?.is_featured ?? false,
    is_verified: school?.is_verified ?? false,
  });

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      ...form,
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      tuition_min: form.tuition_min ? parseInt(form.tuition_min) : null,
      tuition_max: form.tuition_max ? parseInt(form.tuition_max) : null,
      subcategory: form.subcategory || null,
      district: form.district || null,
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      facebook: form.facebook || null,
      description: form.description || null,
      logo_url: form.logo_url || null,
    };

    const url = isEdit ? `/api/admin/schools/${school!.id}` : "/api/admin/schools";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/schools");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Алдаа гарлаа");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Нэр *</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>Ангилал *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="subcategory">Дэд ангилал</Label>
          <Input
            id="subcategory"
            value={form.subcategory}
            onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
            placeholder="Хэлний сургалт, МТ сургалт..."
          />
        </div>
        <div className="space-y-1">
          <Label>Дүүрэг</Label>
          <Select
            value={form.district}
            onValueChange={(v) => setForm((f) => ({ ...f, district: v }))}
          >
            <SelectTrigger><SelectValue placeholder="Сонгох" /></SelectTrigger>
            <SelectContent>
              {DISTRICTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Хаяг</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="phone">Утас</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Имэйл</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="website">Вэбсайт</Label>
          <Input id="website" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="facebook">Facebook</Label>
          <Input id="facebook" value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Тайлбар</Label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="features">Онцлог (таслалаар тусгаарлана уу)</Label>
        <Input
          id="features"
          value={form.features}
          onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
          placeholder="Англи хэл, STEM, Cambridge"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="tuition_min">Төлбөр (доод) ₮</Label>
          <Input
            id="tuition_min"
            type="number"
            value={form.tuition_min}
            onChange={(e) => setForm((f) => ({ ...f, tuition_min: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tuition_max">Төлбөр (дээд) ₮</Label>
          <Input
            id="tuition_max"
            type="number"
            value={form.tuition_max}
            onChange={(e) => setForm((f) => ({ ...f, tuition_max: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="logo_url">Лого URL</Label>
        <Input id="logo_url" value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.is_featured}
            onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: !!v }))}
          />
          <span className="text-sm">Онцлох</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={form.is_verified}
            onCheckedChange={(v) => setForm((f) => ({ ...f, is_verified: !!v }))}
          />
          <span className="text-sm">Баталгаажсан</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Нэмэх"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/schools")}
        >
          Цуцлах
        </Button>
      </div>
    </form>
  );
}
