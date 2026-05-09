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
import { supabase } from "@/lib/supabase";

interface Props {
  school?: School;
}

// Тарифын зураг хязгаар
const IMAGE_LIMITS: Record<string, number> = {
  basic: 5,
  standard: Infinity,
  premium: Infinity,
}

export default function SchoolForm({ school }: Props) {
  const router = useRouter();
  const isEdit = !!school;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState("");
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesProgress, setImagesProgress] = useState("");

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
    video_url: (school as any)?.video_url ?? "",
    images: (school as any)?.images ?? [] as string[],
    tier: (school as any)?.tier ?? "basic",
    is_featured: school?.is_featured ?? false,
    is_verified: school?.is_verified ?? false,
  });

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }));
  }

  // Лого зураг upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Зургийн хэмжээ 2MB-аас бага байх ёстой!");
      return;
    }

    setUploading(true);
    setUploadProgress("Зураг upload хийж байна...");

    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("school-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload алдаа: " + uploadError.message);
      setUploading(false);
      setUploadProgress("");
      return;
    }

    const { data } = supabase.storage.from("school-images").getPublicUrl(filePath);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
    setUploading(false);
    setUploadProgress("✅ Амжилттай upload хийлээ!");
    setTimeout(() => setUploadProgress(""), 3000);
  }

  // Олон зураг upload
  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const limit = IMAGE_LIMITS[form.tier] ?? 5;
    const currentCount = form.images.length;
    const remaining = limit === Infinity ? files.length : limit - currentCount;

    if (remaining <= 0) {
      alert(`${form.tier === 'basic' ? 'Basic' : 'Standard'} тариф дээр ${limit} зургийн хязгаарт хүрсэн байна!`)
      return;
    }

    const filesToUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      alert(`Зөвхөн ${remaining} зураг нэмэх боломжтой. ${files.length - remaining} зураг орхигдлоо.`)
    }

    setImagesUploading(true);
    setImagesProgress(`0/${filesToUpload.length} зураг upload хийж байна...`);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" зургийн хэмжээ 5MB-аас их байна. Орхигдлоо.`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `image-${Date.now()}-${i}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("school-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert(`"${file.name}" upload алдаа: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage.from("school-images").getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
      setImagesProgress(`${i + 1}/${filesToUpload.length} зураг upload хийж байна...`);
    }

    setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
    setImagesUploading(false);
    setImagesProgress(`✅ ${uploadedUrls.length} зураг амжилттай upload хийлээ!`);
    setTimeout(() => setImagesProgress(""), 3000);
  }

  // Зураг устгах
  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_: string, i: number) => i !== index) }));
  }

  // Видео upload
  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Видеоны хэмжээ 50MB-аас бага байх ёстой!");
      return;
    }

    if (form.tier === 'basic') {
      alert("Видео upload хийхэд Standard эсвэл Premium тариф шаардагдана!");
      return;
    }

    setVideoUploading(true);
    setVideoProgress("Видео upload хийж байна...");

    const fileExt = file.name.split(".").pop();
    const fileName = `video-${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("school-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload алдаа: " + uploadError.message);
      setVideoUploading(false);
      setVideoProgress("");
      return;
    }

    const { data } = supabase.storage.from("school-images").getPublicUrl(filePath);
    setForm((f) => ({ ...f, video_url: data.publicUrl }));
    setVideoUploading(false);
    setVideoProgress("✅ Видео амжилттай upload хийлээ!");
    setTimeout(() => setVideoProgress(""), 3000);
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
      video_url: form.video_url || null,
      images: form.images.length > 0 ? form.images : null,
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

  const canUploadVideo = form.tier === 'standard' || form.tier === 'premium';
  const imageLimit = IMAGE_LIMITS[form.tier] ?? 5;
  const remainingImages = imageLimit === Infinity ? '∞' : imageLimit - form.images.length;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Нэр *</Label>
          <Input id="name" required value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </div>
      </div>

      {/* Тариф */}
      <div className="space-y-1">
        <Label>Тариф</Label>
        <Select value={form.tier} onValueChange={(v) => setForm((f) => ({ ...f, tier: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic — ₮99,000/сар (5 зураг)</SelectItem>
            <SelectItem value="standard">Standard — ₮199,000/сар (хязгааргүй зураг)</SelectItem>
            <SelectItem value="premium">Premium — ₮399,000/сар (хязгааргүй зураг)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>Ангилал *</Label>
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}>
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
          <Input id="subcategory" value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} placeholder="Хэлний сургалт..." />
        </div>
        <div className="space-y-1">
          <Label>Дүүрэг</Label>
          <Select value={form.district} onValueChange={(v) => setForm((f) => ({ ...f, district: v }))}>
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
        <Input id="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
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
        <Input id="features" value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} placeholder="Англи хэл, STEM, Cambridge" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="tuition_min">Төлбөр (доод) ₮</Label>
          <Input id="tuition_min" type="number" value={form.tuition_min} onChange={(e) => setForm((f) => ({ ...f, tuition_min: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tuition_max">Төлбөр (дээд) ₮</Label>
          <Input id="tuition_max" type="number" value={form.tuition_max} onChange={(e) => setForm((f) => ({ ...f, tuition_max: e.target.value }))} />
        </div>
      </div>

      {/* Лого upload */}
      <div className="space-y-3">
        <Label>Лого зураг</Label>
        {form.logo_url && (
          <div className="flex items-center gap-3">
            <img src={form.logo_url} alt="Лого" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
            <button type="button" onClick={() => setForm((f) => ({ ...f, logo_url: "" }))} className="text-sm text-red-500 hover:text-red-700">Устгах</button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${uploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
              {uploading ? "⏳ Upload хийж байна..." : "📁 Лого сонгох"}
            </div>
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="hidden" />
          </label>
          {uploadProgress && <span className="text-sm text-green-600">{uploadProgress}</span>}
        </div>
        <p className="text-xs text-gray-400">JPG, PNG, WebP • Дээд хэмжээ: 2MB</p>
        <div className="space-y-1">
          <Label htmlFor="logo_url" className="text-xs text-gray-500">Эсвэл URL-р оруулах</Label>
          <Input id="logo_url" value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
        </div>
      </div>

      {/* Олон зураг upload */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Зурагнууд</Label>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            form.images.length >= imageLimit && imageLimit !== Infinity
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {form.images.length}/{imageLimit === Infinity ? '∞' : imageLimit} зураг
          </span>
        </div>

        {/* Одоогийн зурагнууд */}
        {form.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {form.images.map((img: string, i: number) => (
              <div key={i} className="relative group">
                <img src={img} alt={`Зураг ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload товч */}
        {(imageLimit === Infinity || form.images.length < imageLimit) && (
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                imagesUploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}>
                {imagesUploading ? "⏳ Upload хийж байна..." : "🖼️ Зураг нэмэх"}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                disabled={imagesUploading}
                className="hidden"
              />
            </label>
            {imagesProgress && <span className="text-sm text-green-600">{imagesProgress}</span>}
          </div>
        )}

        {imageLimit !== Infinity && form.images.length >= imageLimit && (
          <p className="text-sm text-red-500">⚠️ Basic тарифын {imageLimit} зургийн хязгаарт хүрсэн. Standard тариф авбал хязгааргүй зураг нэмэх боломжтой.</p>
        )}

        <p className="text-xs text-gray-400">JPG, PNG, WebP • Нэг зургийн дээд хэмжээ: 5MB • Олон зураг нэгэн зэрэг сонгох боломжтой</p>
      </div>

      {/* Видео upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Видео</Label>
          {!canUploadVideo && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Standard / Premium тариф шаардагдана</span>
          )}
        </div>

        {form.video_url && (
          <div className="space-y-2">
            <video src={form.video_url} controls className="w-full rounded-xl max-h-48" />
            <button type="button" onClick={() => setForm((f) => ({ ...f, video_url: "" }))} className="text-sm text-red-500 hover:text-red-700">Видео устгах</button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className={canUploadVideo ? "cursor-pointer" : "cursor-not-allowed opacity-50"}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              videoUploading || !canUploadVideo ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}>
              {videoUploading ? "⏳ Видео upload хийж байна..." : "🎬 Видео сонгох"}
            </div>
            <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={videoUploading || !canUploadVideo} className="hidden" />
          </label>
          {videoProgress && <span className="text-sm text-green-600">{videoProgress}</span>}
        </div>
        <p className="text-xs text-gray-400">MP4, MOV, AVI • Дээд хэмжээ: 50MB</p>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={form.is_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: !!v }))} />
          <span className="text-sm">Онцлох</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={form.is_verified} onCheckedChange={(v) => setForm((f) => ({ ...f, is_verified: !!v }))} />
          <span className="text-sm">Баталгаажсан</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || uploading || videoUploading || imagesUploading}>
          {loading ? "Хадгалж байна..." : isEdit ? "Хадгалах" : "Нэмэх"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/schools")}>
          Цуцлах
        </Button>
      </div>
    </form>
  );
}
