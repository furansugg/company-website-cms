import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Menu } from '../../lib/types';

interface FormState {
  name: string; url: string; parentId: number | null; sortOrder: number; active: boolean; target: string;
}
const empty: FormState = { name: '', url: '', parentId: null, sortOrder: 0, active: true, target: '_self' };

export function AdminMenusPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin', 'menus'],
    queryFn: async (): Promise<Menu[]> => (await api.get('/api/admin/menus')).data,
  });
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) return (await api.put(`/api/admin/menus/${editingId}`, form)).data;
      return (await api.post('/api/admin/menus', form)).data;
    },
    onSuccess: () => {
      setForm(empty); setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'menus'] });
      qc.invalidateQueries({ queryKey: ['public', 'site'] });
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/menus/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'menus'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Menus</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); setError(null); save.mutate(); }} className="card space-y-3">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit' : 'Tambah'} Menu</h2>
          <div><label className="label">Nama</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">URL</label><input className="input" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/about, https://…" /></div>
          <div>
            <label className="label">Parent Menu</label>
            <select className="input" value={form.parentId ?? ''} onChange={(e) => setForm({ ...form, parentId: e.target.value === '' ? null : Number(e.target.value) })}>
              <option value="">— No parent —</option>
              {list.data?.filter((m) => m.id !== editingId).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Urutan</label><input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            <div><label className="label">Target</label>
              <select className="input" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                <option value="_self">_self</option>
                <option value="_blank">_blank</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif</label>
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-2"><button className="btn-primary">{editingId ? 'Update' : 'Tambah'}</button>{editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(empty); }}>Batal</button>}</div>
        </form>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">URL</th><th className="px-4 py-3">Parent</th><th className="px-4 py-3">Urut</th><th></th></tr></thead>
            <tbody>
              {list.data?.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.url}</td>
                  <td className="px-4 py-3 text-slate-500">{m.parentId ? list.data?.find((p) => p.id === m.parentId)?.name : '—'}</td>
                  <td className="px-4 py-3">{m.sortOrder}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="text-xs text-brand-600 hover:underline" onClick={() => { setEditingId(m.id); setForm({ name: m.name, url: m.url, parentId: m.parentId ?? null, sortOrder: m.sortOrder, active: m.active, target: m.target }); }}>Edit</button>
                    <button className="text-xs text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus menu "${m.name}"?`)) del.mutate(m.id); }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {list.data?.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Belum ada menu.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
