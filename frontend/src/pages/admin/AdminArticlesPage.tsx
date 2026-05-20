import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, apiErrorMessage } from '../../lib/api';
import type { Article, ArticleStatus, Category, PageResponse } from '../../lib/types';
import { hasRole, useAuthStore } from '../../stores/auth';

export function AdminArticlesPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canPublish = hasRole(user, ['SUPER_ADMIN', 'ADMIN']);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ArticleStatus | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [page, setPage] = useState(0);

  const articles = useQuery({
    queryKey: ['admin', 'articles', { search, status, categoryId, page }],
    queryFn: async (): Promise<PageResponse<Article>> => {
      const res = await api.get('/api/admin/articles', {
        params: {
          search: search || undefined,
          status: status || undefined,
          categoryId: categoryId || undefined,
          page,
        },
      });
      return res.data;
    },
  });
  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<Category[]> => (await api.get('/api/admin/categories')).data,
  });

  const submit = useMutation({
    mutationFn: async (id: number) => (await api.post(`/api/admin/articles/${id}/submit`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles'] }),
  });
  const publish = useMutation({
    mutationFn: async (id: number) => (await api.post(`/api/admin/articles/${id}/publish`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles'] }),
  });
  const archive = useMutation({
    mutationFn: async (id: number) => (await api.post(`/api/admin/articles/${id}/archive`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles'] }),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/articles/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link to="/admin/articles/new" className="btn-primary">+ Artikel Baru</Link>
      </div>
      <div className="card flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Cari judul…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        <select className="input max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value as ArticleStatus); setPage(0); }}>
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">Review</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select className="input max-w-xs" value={categoryId} onChange={(e) => { setCategoryId(e.target.value === '' ? '' : Number(e.target.value)); setPage(0); }}>
          <option value="">Semua Kategori</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {articles.data?.content.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium"><Link to={`/admin/articles/${a.id}`} className="hover:text-brand-600">{a.title}</Link></td>
                <td className="px-4 py-3"><span className={statusBadge(a.status)}>{a.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID') : '—'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(a.updatedAt).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  {a.status === 'DRAFT' && <button className="text-sm text-brand-600 hover:underline" onClick={() => submit.mutate(a.id)}>Submit</button>}
                  {canPublish && a.status !== 'PUBLISHED' && a.status !== 'ARCHIVED' && (
                    <button className="text-sm text-brand-600 hover:underline" onClick={() => publish.mutate(a.id)}>Publish</button>
                  )}
                  {canPublish && a.status === 'PUBLISHED' && (
                    <button className="text-sm text-slate-600 hover:underline" onClick={() => archive.mutate(a.id)}>Archive</button>
                  )}
                  <button className="text-sm text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus artikel "${a.title}"?`)) del.mutate(a.id); }}>Hapus</button>
                </td>
              </tr>
            ))}
            {articles.data?.content.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Belum ada artikel.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {(submit.error || publish.error || archive.error || del.error) && (
        <div className="text-sm text-red-700">{apiErrorMessage(submit.error || publish.error || archive.error || del.error)}</div>
      )}
      {articles.data && articles.data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: articles.data.totalPages }).map((_, i) => (
            <button key={i} className={`badge ${i === page ? 'badge-green' : 'badge-gray'}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function statusBadge(s: ArticleStatus): string {
  if (s === 'PUBLISHED') return 'badge-green';
  if (s === 'ARCHIVED') return 'badge-red';
  if (s === 'REVIEW') return 'badge-yellow';
  return 'badge-gray';
}
