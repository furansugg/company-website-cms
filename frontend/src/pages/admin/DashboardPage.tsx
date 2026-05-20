import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { DashboardStats } from '../../lib/types';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async (): Promise<DashboardStats> => (await api.get('/api/admin/dashboard')).data,
  });

  if (isLoading) return <div>Memuat dashboard…</div>;
  if (!data) return null;

  const stat = (label: string, value: number | string, to?: string) => (
    <Link to={to ?? '#'} className="card transition hover:shadow-md">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-slate-900">{value}</div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Total Halaman', data.totalPages, '/admin/pages')}
        {stat('Total Artikel', data.totalArticles, '/admin/articles')}
        {stat('Pesan Masuk', data.totalMessages, '/admin/messages')}
        {stat('Total Media', data.totalMedia, '/admin/media')}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Halaman Published', data.publishedPages)}
        {stat('Halaman Draft', data.draftPages)}
        {stat('Artikel Published', data.publishedArticles)}
        {stat('Pesan Belum Dibaca', data.unreadMessages, '/admin/messages')}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold">Artikel Terbaru</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.recentArticles.length === 0 && <li className="py-3 text-sm text-slate-500">Belum ada artikel published.</li>}
            {data.recentArticles.map((a) => (
              <li key={a.id} className="py-3">
                <Link to={`/admin/articles/${a.id}`} className="font-medium hover:text-brand-600">{a.title}</Link>
                <div className="text-xs text-slate-500">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID') : '—'}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">Pesan Terbaru</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.recentMessages.length === 0 && <li className="py-3 text-sm text-slate-500">Belum ada pesan.</li>}
            {data.recentMessages.map((m) => (
              <li key={m.id} className="py-3">
                <div className="font-medium">{m.subject}</div>
                <div className="text-xs text-slate-500">{m.name} · {m.email} · {new Date(m.createdAt).toLocaleString('id-ID')}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
