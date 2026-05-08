# EduFind.mn

Улаанбаатар хотын бүх сургалтын байгууллагыг нэг дороос хайх вэбсайт.

## Технологи

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + custom brand colors
- **shadcn/ui** компонентууд
- **Supabase** (PostgreSQL database + Row Level Security)
- **Vercel** дээр deploy

---

## Эхлүүлэх заавар

### 1. Node.js суулгах

[nodejs.org](https://nodejs.org) хуудаснаас **LTS** хувилбарыг татаж суулгана уу.

### 2. Dependency суулгах

```bash
cd edufind
npm install
```

### 3. Supabase тохируулах

1. [supabase.com](https://supabase.com) дээр шинэ проект үүсгэнэ
2. **SQL Editor** → `supabase/schema.sql` файлын агуулгыг ажиллуулна
3. **SQL Editor** → `supabase/seed.sql` файлын агуулгыг ажиллуулна
4. **Project Settings** → **API** хэсгээс `URL` болон `anon key`-г хуулна

### 4. Environment variables тохируулах

`.env.local.example` файлыг `.env.local` болгон хуулж утгуудыг бөглөнө:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

> `ADMIN_PASSWORD` — Admin нэвтрэх нууц үг. Default: `edufind2025`

### 5. Dev server ажиллуулах

```bash
npm run dev
```

Хөтөч дээр [http://localhost:3000](http://localhost:3000) нээнэ.

---

## Хуудасны бүтэц

| URL | Тайлбар |
|-----|---------|
| `/` | Нүүр хуудас — hero хайлт, ангилалын товч, онцлох сургуулиуд |
| `/search` | Хайлтын хуудас — filter sidebar, grid/list toggle |
| `/school/[slug]` | Сургуулийн дэлгэрэнгүй хуудас |
| `/admin` | Admin хяналтын самбар |
| `/admin/login` | Admin нэвтрэх |
| `/admin/schools` | Байгууллагуудын жагсаалт |
| `/admin/schools/new` | Шинэ байгууллага нэмэх |
| `/admin/schools/[id]` | Байгууллагын мэдээлэл засах |

---

## Vercel дээр Deploy

1. [vercel.com](https://vercel.com) дээр GitHub repo холбоно
2. **Environment Variables** хэсэгт `.env.local` утгуудыг нэмнэ:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
3. **Deploy** товч дарна — автоматаар build хийж ажиллуулна

---

## CSV Import

Admin хуудасны **CSV импорт** товчоор олон байгууллагыг нэг дороос нэмж болно.

CSV файлын баганууд:

```
name,slug,category,subcategory,district,address,phone,email,website,facebook,description,features,tuition_min,tuition_max,is_featured,is_verified
```

- `category`: `ebs` | `ids` | `surgalt`
- `features`: таслалаар тусгаарлана — жишээ: `"Англи хэл,STEM,Cambridge"`
- `is_featured` / `is_verified`: `true` | `false`

---

## Brand өнгө

| Нэр | Hex |
|-----|-----|
| Тод цэнхэр | `#1a3a5c` |
| Цэнхэр гэрэл | `#2a5a8c` |
| Ногоон | `#1ea572` |
| Ногоон гэрэл | `#25c588` |
