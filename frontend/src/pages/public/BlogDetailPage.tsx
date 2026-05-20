import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Article } from '../../lib/types';

export function BlogDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'article', slug],
    queryFn: async (): Promise<Article> => (await api.get(`/api/public/articles/${slug}`)).data,
    enabled: !!slug,
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-12">Memuat…</div>;
  if (error || !data) return <div className="mx-auto max-w-3xl px-4 py-12">Artikel tidak ditemukan.</div>;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/blog" className="text-sm text-brand-600 hover:underline">← Kembali ke blog</Link>
      <h1 className="mt-4 text-3xl font-bold">{data.title}</h1>
      {data.publishedAt && <p className="mt-2 text-sm text-slate-500">{new Date(data.publishedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>}
      {data.featuredImage && <img src={data.featuredImage.url} alt={data.title} className="mt-6 w-full rounded-xl" />}
      {data.excerpt && <p className="mt-6 text-lg text-slate-700">{data.excerpt}</p>}
      <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: contentToHtml(data.content) }} />
      {data.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {data.tags.map((t) => <span key={t.id} className="badge badge-gray">#{t.name}</span>)}
        </div>
      )}
    </article>
  );
}

function contentToHtml(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
