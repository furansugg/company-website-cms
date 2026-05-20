import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Page } from '../../lib/types';

export function PublicPagePage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'page', slug],
    queryFn: async (): Promise<Page> => (await api.get(`/api/public/pages/${slug}`)).data,
    enabled: !!slug,
  });
  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-12">Memuat…</div>;
  if (error || !data) return <div className="mx-auto max-w-3xl px-4 py-12">Halaman tidak ditemukan.</div>;
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      {data.featuredImage && <img src={data.featuredImage.url} alt={data.title} className="mt-6 w-full rounded-xl" />}
      <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: contentToHtml(data.content) }} />
    </article>
  );
}

function contentToHtml(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) return trimmed;
  return trimmed.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`).join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
