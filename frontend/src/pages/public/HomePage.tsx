import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Article, Banner, Service, PageResponse } from '../../lib/types';
import { useSite } from '../../hooks/useSite';

export function HomePage() {
  const { data: site } = useSite();
  const banners = useQuery({
    queryKey: ['public', 'banners'],
    queryFn: async (): Promise<Banner[]> => (await api.get('/api/public/banners')).data,
  });
  const services = useQuery({
    queryKey: ['public', 'services'],
    queryFn: async (): Promise<Service[]> => (await api.get('/api/public/services')).data,
  });
  const articles = useQuery({
    queryKey: ['public', 'articles-home'],
    queryFn: async (): Promise<PageResponse<Article>> =>
      (await api.get('/api/public/articles', { params: { size: 3 } })).data,
  });

  const hero = banners.data?.[0];

  return (
    <div>
      {hero && (
        <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:py-20">
            <div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">{hero.title}</h1>
              {hero.subtitle && <p className="mt-4 text-lg text-brand-50">{hero.subtitle}</p>}
              {hero.ctaText && hero.ctaLink && (
                <Link to={hero.ctaLink} className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50">
                  {hero.ctaText}
                </Link>
              )}
            </div>
            {hero.image && (
              <img src={hero.image.url} alt={hero.title} className="rounded-xl shadow-2xl" />
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Layanan Kami</h2>
          <Link to="/services" className="text-sm text-brand-600 hover:underline">Lihat semua →</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.data?.slice(0, 6).map((s) => (
            <div key={s.id} className="card">
              {s.image && <img src={s.image.url} alt={s.name} className="mb-3 h-32 w-full rounded-lg object-cover" />}
              <h3 className="text-lg font-semibold">{s.name}</h3>
              {s.shortDescription && <p className="mt-1 text-sm text-slate-600">{s.shortDescription}</p>}
            </div>
          ))}
        </div>
      </section>

      {site?.profile.description && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-bold text-slate-900">Tentang {site.profile.name}</h2>
            <p className="mt-4 max-w-3xl text-slate-700">{site.profile.description}</p>
            <Link to="/about" className="mt-6 inline-block text-brand-600 hover:underline">Pelajari lebih lanjut →</Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Artikel Terbaru</h2>
          <Link to="/blog" className="text-sm text-brand-600 hover:underline">Lihat semua →</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.data?.content.map((a) => (
            <Link key={a.id} to={`/blog/${a.slug}`} className="card transition hover:shadow-md">
              {a.featuredImage && <img src={a.featuredImage.url} alt={a.title} className="mb-3 h-36 w-full rounded-lg object-cover" />}
              <h3 className="text-lg font-semibold">{a.title}</h3>
              {a.excerpt && <p className="mt-1 line-clamp-3 text-sm text-slate-600">{a.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
