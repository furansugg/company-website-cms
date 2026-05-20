import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Category } from '../../lib/types';

export function AdminCategoriesPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<Category[]> => (await api.get('/api/admin/categories')).data,
  });
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (payload: typeof form & { id?: number }) => {
      if (payload.id) return (await api.put(`/api/admin/categories/${payload.id}`, payload)).data;
      return (await api.post('/api/admin/categories', payload)).data;
    },
    onSuccess: () => {
      setForm({ name: '', slug: '', description: '' });
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/categories/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
    onError: (e) => setError(apiErrorMessage(e)),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate({ ...form, id: editingId ?? undefined });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={onSubmit} className="card space-y-3 lg:col-span-1">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
          <div>
            <label className="label">Nama</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Slug (opsional)</label>
            <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea className="input h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-2">
            <button className="btn-primary" disabled={save.isPending}>{editingId ? 'Update' : 'Tambah'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm({ name: '', slug: '', description: '' }); }}>Batal</button>}
          </div>
        </form>
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Slug</th><th></th></tr>
            </thead>
            <tbody>
              {list.data?.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.slug}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button className="text-sm text-brand-600 hover:underline" onClick={() => { setEditingId(c.id); setForm({ name: c.name, slug: c.slug, description: c.description ?? '' }); }}>Edit</button>
                    <button className="text-sm text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus kategori "${c.name}"?`)) del.mutate(c.id); }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {list.data?.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Belum ada kategori.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
