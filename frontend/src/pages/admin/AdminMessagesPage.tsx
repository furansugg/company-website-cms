import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { ContactMessage, MessageStatus, PageResponse } from '../../lib/types';

export function AdminMessagesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<MessageStatus | ''>('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'messages', { status, page }],
    queryFn: async (): Promise<PageResponse<ContactMessage>> =>
      (await api.get('/api/admin/messages', { params: { status: status || undefined, page } })).data,
  });
  const detail = useQuery({
    queryKey: ['admin', 'message', selectedId],
    queryFn: async (): Promise<ContactMessage> => (await api.get(`/api/admin/messages/${selectedId}`)).data,
    enabled: !!selectedId,
  });
  const changeStatus = useMutation({
    mutationFn: async (args: { id: number; status: MessageStatus }) =>
      (await api.patch(`/api/admin/messages/${args.id}/status`, { status: args.status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
      qc.invalidateQueries({ queryKey: ['admin', 'message'] });
    },
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/messages/${id}`)).data,
    onSuccess: () => { setSelectedId(null); qc.invalidateQueries({ queryKey: ['admin', 'messages'] }); },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      <div className="card flex flex-wrap gap-3">
        <select className="input max-w-xs" value={status} onChange={(e) => { setStatus(e.target.value as MessageStatus); setPage(0); }}>
          <option value="">Semua Status</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
          <option value="REPLIED">Replied</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-1 p-0">
          <ul className="divide-y divide-slate-100">
            {list.data?.content.map((m) => (
              <li key={m.id}>
                <button onClick={() => setSelectedId(m.id)} className={`flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-slate-50 ${selectedId === m.id ? 'bg-brand-50' : ''}`}>
                  <div className="flex w-full justify-between text-xs">
                    <span className={statusBadge(m.status)}>{m.status}</span>
                    <span className="text-slate-500">{new Date(m.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="font-medium">{m.subject}</div>
                  <div className="text-xs text-slate-500">{m.name} · {m.email}</div>
                </button>
              </li>
            ))}
            {list.data?.content.length === 0 && <li className="px-4 py-6 text-center text-slate-500">Belum ada pesan.</li>}
          </ul>
        </div>
        <div className="card lg:col-span-2">
          {detail.data ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{detail.data.subject}</h2>
                <span className={statusBadge(detail.data.status)}>{detail.data.status}</span>
              </div>
              <div className="text-sm text-slate-600">
                Dari <strong>{detail.data.name}</strong> · <a href={`mailto:${detail.data.email}`} className="text-brand-600 hover:underline">{detail.data.email}</a>
                {detail.data.phone && <> · {detail.data.phone}</>}
              </div>
              <div className="text-xs text-slate-500">{new Date(detail.data.createdAt).toLocaleString('id-ID')}</div>
              <p className="whitespace-pre-line border-t border-slate-100 pt-3 text-slate-800">{detail.data.message}</p>
              <div className="flex flex-wrap gap-2 pt-3">
                {(['READ','REPLIED','ARCHIVED'] as MessageStatus[]).map((st) => (
                  <button key={st} className="btn-secondary" onClick={() => changeStatus.mutate({ id: detail.data!.id, status: st })}>Tandai {st}</button>
                ))}
                <button className="btn-danger" onClick={() => { if (confirm('Hapus pesan ini?')) del.mutate(detail.data!.id); }}>Hapus</button>
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-slate-500">Pilih pesan untuk melihat detail.</p>
          )}
        </div>
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

function statusBadge(s: MessageStatus): string {
  if (s === 'UNREAD') return 'badge-yellow';
  if (s === 'READ') return 'badge-gray';
  if (s === 'REPLIED') return 'badge-green';
  return 'badge-red';
}
