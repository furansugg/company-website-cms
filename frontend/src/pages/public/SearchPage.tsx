import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Article, Page } from '../../lib/types';

interface SearchResponse {
  query: string;
  articles: Article[];
  pages: Page[];
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'search', q],
    queryFn: async (): Promise<SearchResponse> => (await api.get('/api/public/search', { params: { q } })).data,
    enabled: !!q,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Hasil pencarian: "{q}"</h1>
      {isLoading && <p className="mt-4 text-slate-600">Mencari…</p>}
      {data && (
        <>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Artikel</h2>
            {data.articles.length === 0 && <p className="mt-2 text-slate-600">Tidak ada artikel.</p>}
            <ul className="mt-3 space-y-3">
              {data.articles.map((a) => (
                <li key={a.id} className="card">
                  <Link to={`/blog/${a.slug}`} className="font-semibold text-brand-700 hover:underline">{a.title}</Link>
                  {a.excerpt && <p className="mt-1 text-sm text-slate-600">{a.excerpt}</p>}
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Halaman</h2>
            {data.pages.length === 0 && <p className="mt-2 text-slate-600">Tidak ada halaman.</p>}
            <ul className="mt-3 space-y-3">
              {data.pages.map((p) => (
                <li key={p.id} className="card">
                  <Link to={`/page/${p.slug}`} className="font-semibold text-brand-700 hover:underline">{p.title}</Link>
                  {p.excerpt && <p className="mt-1 text-sm text-slate-600">{p.excerpt}</p>}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
