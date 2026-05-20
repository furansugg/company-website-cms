-- =====================================================================
-- Company Website CMS - Initial Schema
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- Users & Roles
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(190)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    full_name       VARCHAR(190)  NOT NULL,
    role            VARCHAR(32)   NOT NULL,
    status          VARCHAR(32)   NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT users_role_check   CHECK (role   IN ('SUPER_ADMIN','ADMIN','EDITOR')),
    CONSTRAINT users_status_check CHECK (status IN ('ACTIVE','DISABLED'))
);
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------
CREATE TABLE media (
    id              BIGSERIAL PRIMARY KEY,
    file_name       VARCHAR(255)  NOT NULL,
    original_name   VARCHAR(255)  NOT NULL,
    file_type       VARCHAR(100)  NOT NULL,
    file_size       BIGINT        NOT NULL,
    file_path       VARCHAR(500)  NOT NULL,
    url             VARCHAR(500)  NOT NULL,
    width           INTEGER,
    height          INTEGER,
    alt_text        VARCHAR(255),
    uploaded_by     BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- ---------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------
CREATE TABLE pages (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255)  NOT NULL,
    slug                VARCHAR(255)  NOT NULL UNIQUE,
    content             TEXT          NOT NULL DEFAULT '',
    excerpt             VARCHAR(500),
    meta_title          VARCHAR(255),
    meta_description    VARCHAR(500),
    status              VARCHAR(32)   NOT NULL DEFAULT 'DRAFT',
    featured_image_id   BIGINT        REFERENCES media(id) ON DELETE SET NULL,
    published_at        TIMESTAMPTZ,
    created_by          BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    updated_by          BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT pages_status_check CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);
CREATE INDEX idx_pages_status ON pages(status);

-- ---------------------------------------------------------------------
-- Categories & Tags
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(80) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------
CREATE TABLE articles (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    excerpt             VARCHAR(500),
    content             TEXT NOT NULL DEFAULT '',
    category_id         BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    featured_image_id   BIGINT REFERENCES media(id) ON DELETE SET NULL,
    author_id           BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status              VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    published_at        TIMESTAMPTZ,
    meta_title          VARCHAR(255),
    meta_description    VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT articles_status_check CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED'))
);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id);

CREATE TABLE article_tags (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id     BIGINT NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- ---------------------------------------------------------------------
-- Company profile (singleton row, id=1)
-- ---------------------------------------------------------------------
CREATE TABLE company_profile (
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(190) NOT NULL,
    tagline         VARCHAR(255),
    description     TEXT,
    vision          TEXT,
    mission         TEXT,
    address         VARCHAR(500),
    phone           VARCHAR(80),
    email           VARCHAR(190),
    logo_id         BIGINT REFERENCES media(id) ON DELETE SET NULL,
    facebook_url    VARCHAR(255),
    instagram_url   VARCHAR(255),
    twitter_url     VARCHAR(255),
    linkedin_url    VARCHAR(255),
    youtube_url     VARCHAR(255),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Services / Products
-- ---------------------------------------------------------------------
CREATE TABLE services (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(190) NOT NULL,
    slug                VARCHAR(190) NOT NULL UNIQUE,
    short_description   VARCHAR(500),
    description         TEXT,
    image_id            BIGINT REFERENCES media(id) ON DELETE SET NULL,
    price               NUMERIC(14,2),
    currency            VARCHAR(8) DEFAULT 'IDR',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_active_order ON services(is_active, sort_order);

-- ---------------------------------------------------------------------
-- Banners / Hero
-- ---------------------------------------------------------------------
CREATE TABLE banners (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    subtitle    VARCHAR(500),
    image_id    BIGINT REFERENCES media(id) ON DELETE SET NULL,
    cta_text    VARCHAR(80),
    cta_link    VARCHAR(255),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_banners_active_order ON banners(is_active, sort_order);

-- ---------------------------------------------------------------------
-- Contact Messages
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(190) NOT NULL,
    email       VARCHAR(190) NOT NULL,
    phone       VARCHAR(80),
    subject     VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    status      VARCHAR(32) NOT NULL DEFAULT 'UNREAD',
    ip_address  VARCHAR(64),
    user_agent  VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contact_messages_status_check CHECK (status IN ('UNREAD','READ','REPLIED','ARCHIVED'))
);
CREATE INDEX idx_messages_status ON contact_messages(status);
CREATE INDEX idx_messages_created_at ON contact_messages(created_at DESC);

-- ---------------------------------------------------------------------
-- Menu items
-- ---------------------------------------------------------------------
CREATE TABLE menus (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    url         VARCHAR(500) NOT NULL,
    parent_id   BIGINT REFERENCES menus(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    target      VARCHAR(16) NOT NULL DEFAULT '_self',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT menus_target_check CHECK (target IN ('_self','_blank'))
);
CREATE INDEX idx_menus_parent_order ON menus(parent_id, sort_order);

-- ---------------------------------------------------------------------
-- Website + SEO settings (singleton id=1)
-- ---------------------------------------------------------------------
CREATE TABLE website_settings (
    id                      BIGINT PRIMARY KEY,
    site_name               VARCHAR(190) NOT NULL,
    logo_id                 BIGINT REFERENCES media(id) ON DELETE SET NULL,
    favicon_id              BIGINT REFERENCES media(id) ON DELETE SET NULL,
    primary_color           VARCHAR(16) DEFAULT '#2563eb',
    footer_text             VARCHAR(500),
    contact_email           VARCHAR(190),
    facebook_url            VARCHAR(255),
    instagram_url           VARCHAR(255),
    twitter_url             VARCHAR(255),
    linkedin_url            VARCHAR(255),
    youtube_url             VARCHAR(255),
    default_meta_title      VARCHAR(255),
    default_meta_description VARCHAR(500),
    og_image_id             BIGINT REFERENCES media(id) ON DELETE SET NULL,
    robots_txt              TEXT,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_email  VARCHAR(190),
    action      VARCHAR(120) NOT NULL,
    entity_type VARCHAR(120),
    entity_id   VARCHAR(120),
    metadata    TEXT,
    ip_address  VARCHAR(64),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
