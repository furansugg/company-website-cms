import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Tag } from '../../lib/types';

export function AdminTagsPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: async (): Promise<Tag[]> => (await api.get('/api/admin/tags')).data,
  });
  const [form, setForm] = useState({ name: '', slug: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (payload: typeof form & { id?: number }) => {
      if (payload.id) return (await api.put(`/api/admin/tags/${payload.id}`, payload)).data;
      return (await api.post('/api/admin/tags', payload)).data;
    },
    onSuccess: () => {
      setForm({ name: '', slug: '' });
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/tags/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tags'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tags</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={(e) => { e.preventDefault(); setError(null); save.mutate({ ...form, id: editingId ?? undefined }); }} className="card space-y-3">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit Tag' : 'Tambah Tag'}</h2>
          <div>
            <label className="label">Nama</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Slug</label>
            <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-2">
            <button className="btn-primary">{editingId ? 'Update' : 'Tambah'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm({ name: '', slug: '' }); }}>Batal</button>}
          </div>
        </form>
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Slug</th><th></th></tr></thead>
            <tbody>
              {list.data?.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.slug}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button className="text-sm text-brand-600 hover:underline" onClick={() => { setEditingId(t.id); setForm({ name: t.name, slug: t.slug }); }}>Edit</button>
                    <button className="text-sm text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus tag "${t.name}"?`)) del.mutate(t.id); }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {list.data?.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Belum ada tag.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
