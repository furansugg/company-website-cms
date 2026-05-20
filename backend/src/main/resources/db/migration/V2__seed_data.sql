-- =====================================================================
-- Seed reference data (users are seeded by DataSeeder Java component on
-- application startup to ensure correct BCrypt password hashing).
-- =====================================================================

-- Company profile singleton
INSERT INTO company_profile (id, name, tagline, description, vision, mission, address, phone, email)
VALUES (1,
    'PT Contoh Perusahaan',
    'Solusi terbaik untuk bisnis Anda',
    'Kami adalah perusahaan yang bergerak di bidang teknologi informasi dan menyediakan solusi digital end-to-end.',
    'Menjadi mitra teknologi terdepan untuk transformasi digital di Indonesia.',
    'Memberikan layanan berkualitas tinggi dengan harga yang kompetitif.',
    'Jl. Sudirman No. 1, Jakarta Pusat, Indonesia',
    '+62 21 1234 5678',
    'info@example.com');

-- Website settings singleton
INSERT INTO website_settings (id, site_name, primary_color, footer_text, contact_email,
                              default_meta_title, default_meta_description, robots_txt)
VALUES (1,
    'PT Contoh Perusahaan',
    '#2563eb',
    '(c) 2026 PT Contoh Perusahaan. All rights reserved.',
    'info@example.com',
    'PT Contoh Perusahaan - Solusi Digital Terbaik',
    'Kami menyediakan solusi digital end-to-end untuk transformasi bisnis Anda.',
    E'User-agent: *\nAllow: /\nDisallow: /admin\n');

-- Default categories
INSERT INTO categories (name, slug, description) VALUES
('Berita',    'berita',    'Berita perusahaan terbaru'),
('Artikel',   'artikel',   'Artikel umum'),
('Teknologi', 'teknologi', 'Pembahasan teknologi');

-- Default tags
INSERT INTO tags (name, slug) VALUES
('Umum', 'umum'),
('Update', 'update'),
('Tips', 'tips');

-- Default services
INSERT INTO services (name, slug, short_description, description, is_active, sort_order) VALUES
('Web Development',      'web-development',      'Pembuatan website modern',         'Kami membangun website responsive dan SEO friendly menggunakan teknologi terkini.', TRUE, 1),
('Mobile App',           'mobile-app',           'Aplikasi mobile iOS & Android',    'Pengembangan aplikasi mobile native dan cross-platform.',                          TRUE, 2),
('Konsultasi IT',        'konsultasi-it',        'Konsultasi strategi IT bisnis',    'Layanan konsultasi untuk membantu transformasi digital perusahaan Anda.',         TRUE, 3);

-- Default banner
INSERT INTO banners (title, subtitle, cta_text, cta_link, is_active, sort_order) VALUES
('Selamat Datang di PT Contoh Perusahaan', 'Mitra terpercaya untuk transformasi digital Anda.', 'Pelajari Lebih Lanjut', '/about', TRUE, 1);

-- Default menus
INSERT INTO menus (name, url, sort_order, is_active) VALUES
('Home',     '/',         1, TRUE),
('About',    '/about',    2, TRUE),
('Services', '/services', 3, TRUE),
('Blog',     '/blog',     4, TRUE),
('Contact',  '/contact',  5, TRUE);

-- Default pages
INSERT INTO pages (title, slug, content, meta_title, meta_description, status, published_at) VALUES
('Home',     'home',     E'<h1>Selamat datang di PT Contoh Perusahaan</h1>\n<p>Kami menyediakan solusi digital terbaik untuk bisnis Anda.</p>',
                           'Home - PT Contoh Perusahaan', 'Selamat datang di website resmi PT Contoh Perusahaan.',
                           'PUBLISHED', NOW()),
('About Us', 'about',    E'<h1>Tentang Kami</h1>\n<p>PT Contoh Perusahaan didirikan untuk membantu bisnis bertransformasi secara digital.</p>',
                           'About Us', 'Tentang PT Contoh Perusahaan.',
                           'PUBLISHED', NOW()),
('Contact',  'contact',  E'<h1>Hubungi Kami</h1>\n<p>Silakan isi formulir di bawah ini, kami akan merespons sesegera mungkin.</p>',
                           'Contact', 'Hubungi PT Contoh Perusahaan.',
                           'PUBLISHED', NOW()),
('Privacy Policy',       'privacy-policy',       E'<h1>Kebijakan Privasi</h1>\n<p>Konten kebijakan privasi.</p>',
                           'Privacy Policy', 'Kebijakan privasi.',
                           'PUBLISHED', NOW()),
('Terms and Conditions', 'terms-and-conditions', E'<h1>Syarat dan Ketentuan</h1>\n<p>Konten syarat dan ketentuan.</p>',
                           'Terms', 'Syarat dan ketentuan.',
                           'PUBLISHED', NOW());

-- Sample articles (author_id will be backfilled by seeder after users exist)
INSERT INTO articles (title, slug, excerpt, content, category_id, status, published_at, meta_title, meta_description) VALUES
('Selamat Datang di Blog Kami', 'selamat-datang-di-blog-kami',
    'Artikel pertama di blog perusahaan kami.',
    E'<p>Ini adalah artikel pertama yang dipublikasikan di blog perusahaan kami. Terima kasih telah berkunjung!</p>',
    1, 'PUBLISHED', NOW(),
    'Selamat Datang di Blog Kami', 'Artikel pertama di blog perusahaan.'),
('5 Tips Memulai Transformasi Digital', '5-tips-memulai-transformasi-digital',
    'Tips praktis memulai transformasi digital untuk bisnis Anda.',
    E'<p>Transformasi digital tidak harus rumit. Berikut 5 tips praktis untuk memulai.</p>\n<ol><li>Mulai dari kebutuhan nyata</li><li>Libatkan tim</li><li>Pilih partner yang tepat</li><li>Iterasi kecil</li><li>Ukur dan evaluasi</li></ol>',
    3, 'PUBLISHED', NOW(),
    '5 Tips Transformasi Digital', 'Tips praktis memulai transformasi digital.');

-- Sample article tags
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 3);
