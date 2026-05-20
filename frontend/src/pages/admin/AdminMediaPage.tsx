import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Media, PageResponse } from '../../lib/types';
import { hasRole, useAuthStore } from '../../stores/auth';

export function AdminMediaPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canDelete = hasRole(user, ['SUPER_ADMIN', 'ADMIN']);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const list = useQuery({
    queryKey: ['admin', 'media', { search, page }],
    queryFn: async (): Promise<PageResponse<Media>> => (await api.get('/api/admin/media', { params: { search: search || undefined, page, size: 48 } })).data,
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return (await api.post<Media>('/api/admin/media', fd)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'media'] }),
    onError: (e) => alert(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/media/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'media'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <label className="btn-primary cursor-pointer">
          {upload.isPending ? 'Mengupload…' : 'Upload File'}
          <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }} />
        </label>
      </div>
      <div className="card flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Cari nama file…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {list.data?.content.map((m) => (
          <div key={m.id} className="card p-2">
            {m.fileType.startsWith('image/')
              ? <img src={m.url} alt={m.originalName} className="h-32 w-full rounded object-cover" />
              : <div className="grid h-32 w-full place-items-center rounded bg-slate-100 text-xs text-slate-500">{m.fileType}</div>}
            <div className="mt-2 truncate text-sm font-medium">{m.originalName}</div>
            <div className="text-xs text-slate-500">{(m.fileSize / 1024).toFixed(1)} KB</div>
            <div className="mt-2 flex items-center justify-between">
              <a className="text-xs text-brand-600 hover:underline" href={m.url} target="_blank" rel="noreferrer">Buka</a>
              {canDelete && (
                <button className="text-xs text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus "${m.originalName}"?`)) del.mutate(m.id); }}>Hapus</button>
              )}
            </div>
          </div>
        ))}
        {list.data?.content.length === 0 && <p className="col-span-full py-8 text-center text-slate-500">Belum ada media.</p>}
      </div>
      {list.data && list.data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: list.data.totalPages }).map((_, i) => (
            <button key={i} className={`badge ${i === page ? 'badge-green' : 'badge-gray'}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
