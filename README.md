# ГУС — Гүйцэтгэлийн Удирдлагын Систем

Барилгын ажлын гүйцэтгэлийн хяналт, цалингийн тооцооны вэб систем.

## Technology Stack

| Технологи | Зорилго |
|-----------|---------|
| Next.js 14 (App Router) | Frontend framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Database, Auth, Storage, Realtime |
| Recharts | Charts |
| SheetJS (xlsx) | Excel Import/Export |
| Zustand + TanStack Query | State management |
| Vercel | Deployment |

## Суулгах заавар

### 1. Dependencies суулгах

```bash
npm install
```

### 2. Environment variables тохируулах

```bash
cp .env.local.example .env.local
```

`.env.local` файлд Supabase-ийн мэдээллийг оруулна:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 3. Database schema тохируулах

Supabase dashboard → SQL Editor дээр дараалан ажиллуулна:

```sql
-- Эхлээд schema
\i database/schema.sql

-- Дараа нь RLS policies
\i database/rls.sql
```

### 4. shadcn/ui компонентуудыг суулгах

```bash
npx shadcn@latest init
npx shadcn@latest add button input label select table badge card dialog dropdown-menu tabs toast
```

### 5. Хөгжүүлэлтийн сервер ажиллуулах

```bash
npm run dev
```

`http://localhost:3000` дээр нээнэ.

## Суpabase Тохиргоо

### Storage buckets үүсгэх

Supabase dashboard → Storage дээр:
- `photos` bucket (public) — Өдрийн тайлангийн зурагт
- `documents` bucket (private) — Гэрээний баримтад

### Realtime идэвхжүүлэх

Supabase dashboard → Database → Replication:
- `daily_reports` ✓
- `project_performance` ✓  
- `clarification_requests` ✓
- `notifications` ✓

## Хэрэглэгчийн Дүрүүд

| Дүр | Монгол нэр | Эрх |
|-----|-----------|-----|
| `superadmin` | Супер Админ | Бүх эрх |
| `admin` | Админ | Удирдлагын эрх |
| `chief_eng` | Ерөнхий Инженер | Батлах, дашбоард |
| `project_manager` | Төслийн Менежер | Хянах, батлах |
| `foreman` | Форман | Өдрийн тайлан оруулах |
| `staff` | Ажилтан | Өөрийн мэдээлэл харах |
| `accountant` | Нягтлан Бодогч | Цалингийн тооцоо |
| `hr` | HR | Ажилтны мэдээлэл |

## Хуудасны Бүтэц

```
/dashboard              — Удирдлагын дашбоард
/projects               — Гэрээний бүртгэл
/projects/[id]/jobs     — Ажлын тоо хэмжээ
/weekly-plans           — 7 хоногийн төлөвлөгөө
/daily-reports          — Өдрийн тайлан
/performance            — Гүйцэтгэлийн хяналт
/my-performance         — Ажилтны хувийн кабинет
/salary                 — Цалингийн бүртгэл
/job-library            — Ажлын сан
/staff                  — Ажилтны бүртгэл
/reports                — Тайлан экспорт
/settings               — Системийн тохиргоо
```

## Excel Import Template-ууд

### JobLibrary Import
```
JobID | Ажлын нэр | Бүлгийн код | Бүлгийн нэр | Хэмжих нэгж | Хүн.цаг | Тайлбар
```

### ProjectJobs Import
```
ProjectID | Барилгын дугаар | Давхрын дугаар | Бүлгийн код | Бүлгийн нэр | JobID | Хүн.цаг | Тоо хэмжээ
```

### Salary Import
```
StaffID | Сар (YYYY.MM) | Үндсэн цаг | Илүү цаг | Томилолтын цаг | Шөнийн цаг | Нийт цаг | Нэгж цалин | НДШ | ХХОАТ | Суутгал | Гарт олгосон цалин
```

## Deployment (Vercel)

```bash
npm run build
vercel --prod
```

Vercel-д environment variables нэмэх:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
