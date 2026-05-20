# Company Website CMS

CMS berbasis web untuk mengelola konten website perusahaan (halaman, artikel/blog, media, layanan, banner, pesan, menu, SEO, dll.) tanpa perlu mengubah kode secara manual.

## Stack

- **Backend**: Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Flyway, PostgreSQL, JWT (jjwt), SpringDoc OpenAPI/Swagger UI.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Axios.
- **Storage**: Local filesystem (dapat diganti cloud storage di kemudian hari).
- **Deployment**: Docker + Docker Compose.

## Fitur (Phase 1–3)

| Modul | Fitur |
|-------|-------|
| Auth | Login email/password, JWT, logout, role-based access (SUPER_ADMIN / ADMIN / EDITOR) |
| Dashboard | Statistik halaman, artikel, pesan, media, ringkasan terbaru |
| Pages | CRUD halaman, slug auto, status DRAFT/PUBLISHED/ARCHIVED, featured image, SEO |
| Articles | CRUD artikel, workflow DRAFT→REVIEW→PUBLISHED→ARCHIVED, kategori, tags, featured image |
| Categories & Tags | CRUD lengkap |
| Media Library | Upload (image/document), filter, hapus, dipakai oleh Page/Article/Service/Banner |
| Company Profile | Singleton: nama, logo, deskripsi, visi/misi, alamat, kontak, sosmed |
| Services | CRUD layanan/produk dengan harga, gambar, urutan, aktif/nonaktif |
| Banners | CRUD hero/banner dengan CTA |
| Contact Messages | Daftar pesan masuk, status UNREAD/READ/REPLIED/ARCHIVED |
| Menus | CRUD menu navigasi dengan parent + circular check |
| Website Settings | Singleton: nama site, logo, favicon, color, SEO defaults, robots.txt |
| Users & Roles | CRUD user (SUPER_ADMIN only) + reset password |
| Audit Log | Aktivitas penting tersimpan otomatis |
| Public Website | Home, About, Services, Blog list & detail, Contact form, Search, halaman dinamis |
| SEO | Sitemap.xml & robots.txt otomatis |

## Default users (seed otomatis saat pertama kali run)

| Email | Password | Role |
|-------|----------|------|
| `super.admin@example.com` | `Admin123!` | SUPER_ADMIN |
| `admin@example.com` | `Admin123!` | ADMIN |
| `editor@example.com` | `Editor123!` | EDITOR |

> Ganti password ini di production. Bisa langsung lewat menu **Users** atau set ulang via SQL.

## Cara menjalankan (Docker Compose, paling cepat)

```bash
docker compose up --build
```

Setelah semua container up:

- Public website: <http://localhost:8081>
- Admin panel: <http://localhost:8081/admin>
- Backend API: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- PostgreSQL: `localhost:5432` (user `cms` / pass `cms_password` / db `cms`)

## Cara menjalankan secara manual (development)

### 1. PostgreSQL

```bash
docker run -d --name cms-postgres -p 5432:5432 \
  -e POSTGRES_USER=cms -e POSTGRES_PASSWORD=cms_password -e POSTGRES_DB=cms \
  postgres:16-alpine
```

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

Backend akan berjalan di port `8080`. Flyway otomatis migrasi schema; `DataSeeder` membuat default users.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server berjalan di <http://localhost:5173> dan auto-proxy ke backend di `:8080`.

## Konfigurasi environment

Backend (`application.yml` atau env vars):

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/cms` | Connection string PostgreSQL |
| `DB_USERNAME` | `cms` | DB user |
| `DB_PASSWORD` | `cms_password` | DB password |
| `JWT_SECRET` | dev secret panjang | Min 64 char (HS256). **Wajib ganti di production.** |
| `JWT_EXPIRATION_MS` | `86400000` (1 hari) | Lama JWT berlaku |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Origin yang diizinkan |
| `STORAGE_ROOT` | `./uploads` | Path absolut folder upload |
| `STORAGE_PUBLIC_BASE_URL` | `/uploads` | URL prefix media |
| `PUBLIC_SITE_BASE_URL` | `http://localhost:5173` | Base URL untuk sitemap |

## API

- REST API: `/api/auth/*`, `/api/admin/*` (auth required), `/api/public/*` (no auth).
- Swagger UI: `/swagger-ui.html`.

Beberapa endpoint kunci:

- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET /api/admin/dashboard`
- `POST /api/admin/media` (multipart `file`)
- `POST /api/admin/articles/{id}/publish` (ADMIN/SUPER_ADMIN)
- `GET /api/public/articles?page=0&size=10&search=...&categoryId=...`
- `POST /api/public/contact` `{ name, email, phone?, subject, message }`
- `GET /api/public/sitemap.xml`
- `GET /api/public/robots.txt`

## Validation rules

- Email user unik.
- Slug halaman/artikel/kategori/tag/layanan unik.
- Judul tidak boleh kosong.
- Konten halaman/artikel wajib diisi saat publish.
- File upload dibatasi tipe (image/document) & ukuran (default 10 MB).
- Artikel hanya bisa dipublish oleh ADMIN/SUPER_ADMIN.
- Menu tidak boleh memiliki circular parent.

## Struktur folder

```
.
├── backend/                 # Spring Boot app
│   ├── src/main/java/id/devin9997/cms/
│   │   ├── auth/             # Auth + JWT
│   │   ├── user/             # User & role management
│   │   ├── page/             # Pages
│   │   ├── article/          # Articles + tags + workflow
│   │   ├── category/, tag/   # Taxonomy
│   │   ├── media/            # Media upload
│   │   ├── profile/          # Company profile
│   │   ├── service/, banner/ # Services & banners
│   │   ├── message/, menu/   # Contact messages, menus
│   │   ├── settings/         # Website settings
│   │   ├── audit/            # Audit log
│   │   ├── dashboard/        # Dashboard stats
│   │   ├── publik/           # Public API + sitemap
│   │   └── config/           # Security, CORS, OpenAPI, JPA auditing
│   ├── src/main/resources/db/migration/   # Flyway SQL
│   └── pom.xml
├── frontend/                # Vite + React + TS
│   ├── src/
│   │   ├── pages/admin/      # 16 admin pages
│   │   ├── pages/public/     # 7 public pages
│   │   ├── components/, layouts/, hooks/, stores/, lib/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Roadmap

- [x] **Phase 1** — Auth, RBAC, dashboard, page, article, category/tag.
- [x] **Phase 2** — Media library, company profile, services, banners, public website.
- [x] **Phase 3** — Contact form, contact messages, SEO settings, sitemap, menus.
- [ ] **Phase 4** — Advanced audit log filters, granular permission, theme customization, multi-language, content versioning, cloud storage.

## License

Internal project — adjust to your needs.
