import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Article, Category, PageResponse } from '../../lib/types';

export function BlogListPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '0');
  const categoryId = params.get('categoryId') ? Number(params.get('categoryId')) : undefined;
  const q = params.get('q') ?? '';

  const articles = useQuery({
    queryKey: ['public', 'articles', { page, categoryId, q }],
    queryFn: async (): Promise<PageResponse<Article>> => {
      const res = await api.get('/api/public/articles', { params: { page, size: 9, categoryId, search: q || undefined } });
      return res.data;
    },
  });
  const categories = useQuery({
    queryKey: ['public', 'categories'],
    queryFn: async (): Promise<Category[]> => (await api.get('/api/public/categories')).data,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Blog</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setParams({ ...(q ? { q } : {}) })}
          className={`badge ${!categoryId ? 'badge-green' : 'badge-gray'}`}
        >
          Semua
        </button>
        {categories.data?.map((c) => (
          <button
            key={c.id}
            onClick={() => setParams({ categoryId: String(c.id), ...(q ? { q } : {}) })}
            className={`badge ${categoryId === c.id ? 'badge-green' : 'badge-gray'}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.data?.content.map((a) => (
          <Link key={a.id} to={`/blog/${a.slug}`} className="card transition hover:shadow-md">
            {a.featuredImage && <img src={a.featuredImage.url} alt={a.title} className="mb-3 h-44 w-full rounded-lg object-cover" />}
            <h2 className="text-lg font-semibold">{a.title}</h2>
            {a.publishedAt && <p className="mt-1 text-xs text-slate-500">{new Date(a.publishedAt).toLocaleDateString('id-ID')}</p>}
            {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.excerpt}</p>}
          </Link>
        ))}
      </div>
      {articles.data && articles.data.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: articles.data.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setParams({ page: String(i), ...(categoryId ? { categoryId: String(categoryId) } : {}), ...(q ? { q } : {}) })}
              className={`badge ${i === page ? 'badge-green' : 'badge-gray'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
