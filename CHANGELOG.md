# Changelog

All notable changes to **Company Website CMS** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (initial release)

- Spring Boot 3 backend with JPA + Flyway + JWT auth.
- 3 role RBAC (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
- 13 domain modules: auth, users, pages, articles (with review/publish workflow),
  categories, tags, media library, company profile, services/products, banners,
  contact messages, menus, website/SEO settings, audit log, dashboard.
- Public REST API (`/api/public/*`) for the public-facing site, including
  `sitemap.xml` and `robots.txt` generation.
- React + Vite + TypeScript + Tailwind frontend with 16 admin pages and
  8 public pages.
- Reusable `MediaPicker` component (upload or pick from library).
- Local file storage with type & size validation; static files served at
  `/uploads/**`.
- Docker Compose stack (`postgres` + `backend` + `frontend` nginx).
- Seeded default users for immediate testing.
- README with setup, env vars, default credentials, and roadmap.
- `.env.example` for Docker Compose configuration.

### Not yet implemented (Phase 4)

- Granular per-permission editing.
- Theme customization UI.
- Multi-language content.
- Content versioning history.
- Cloud storage adapter.
