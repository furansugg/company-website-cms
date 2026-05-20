import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { AuditLog, PageResponse } from '../../lib/types';

export function AdminAuditLogPage() {
  const [page, setPage] = useState(0);
  const { data } = useQuery({
    queryKey: ['admin', 'audit', page],
    queryFn: async (): Promise<PageResponse<AuditLog>> => (await api.get('/api/admin/audit-logs', { params: { page, size: 30 } })).data,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Meta</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">{new Date(l.createdAt).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3">{l.userEmail ?? '—'}</td>
                <td className="px-4 py-3 font-medium">{l.action}</td>
                <td className="px-4 py-3 text-slate-600">{l.entityType ? `${l.entityType}#${l.entityId ?? ''}` : '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{l.metadata ?? ''}</td>
              </tr>
            ))}
            {data?.content.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Belum ada audit log.</td></tr>}
          </tbody>
        </table>
      </div>
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
