import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, apiErrorMessage } from '../../lib/api';
import type { Page, PageResponse, PublishStatus } from '../../lib/types';

export function AdminPagesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PublishStatus | ''>('');
  const [page, setPage] = useState(0);
  const { data } = useQuery({
    queryKey: ['admin', 'pages', { search, status, page }],
    queryFn: async (): Promise<PageResponse<Page>> => {
      const res = await api.get('/api/admin/pages', { params: { search: search || undefined, status: status || undefined, page } });
      return res.data;
    },
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/pages/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });
  const changeStatus = useMutation({
    mutationFn: async (args: { id: number; status: PublishStatus }) =>
      (await api.patch(`/api/admin/pages/${args.id}/status`, { status: args.status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link to="/admin/pages/new" className="btn-primary">+ Halaman Baru</Link>
      </div>
      <div className="card flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Cari judul…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        <select className="input max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value as PublishStatus); setPage(0); }}>
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium"><Link to={`/admin/pages/${p.id}`} className="hover:text-brand-600">{p.title}</Link></td>
                <td className="px-4 py-3 text-slate-600">/{p.slug}</td>
                <td className="px-4 py-3"><span className={statusBadge(p.status)}>{p.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{new Date(p.updatedAt).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-right">
                  {p.status !== 'PUBLISHED' && (
                    <button className="text-sm text-brand-600 hover:underline mr-3" onClick={() => changeStatus.mutate({ id: p.id, status: 'PUBLISHED' })}>Publish</button>
                  )}
                  {p.status === 'PUBLISHED' && (
                    <button className="text-sm text-slate-600 hover:underline mr-3" onClick={() => changeStatus.mutate({ id: p.id, status: 'DRAFT' })}>Unpublish</button>
                  )}
                  <button className="text-sm text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus halaman "${p.title}"?`)) del.mutate(p.id); }}>Hapus</button>
                </td>
              </tr>
            ))}
            {data?.content.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Belum ada halaman.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {del.error && <div className="text-sm text-red-700">{apiErrorMessage(del.error)}</div>}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <button key={i} className={`badge ${i === page ? 'badge-green' : 'badge-gray'}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function statusBadge(s: PublishStatus): string {
  if (s === 'PUBLISHED') return 'badge-green';
  if (s === 'ARCHIVED') return 'badge-red';
  return 'badge-yellow';
}
