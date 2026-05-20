import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Media, Service } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';

interface FormState {
  name: string; slug: string; shortDescription: string; description: string;
  imageId: number | null; price: string; currency: string; active: boolean; sortOrder: number;
}
const empty: FormState = { name: '', slug: '', shortDescription: '', description: '', imageId: null, price: '', currency: 'IDR', active: true, sortOrder: 0 };

export function AdminServicesPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async (): Promise<Service[]> => (await api.get('/api/admin/services')).data,
  });
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [image, setImage] = useState<Media | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, price: form.price ? Number(form.price) : null };
      if (editingId) return (await api.put(`/api/admin/services/${editingId}`, payload)).data;
      return (await api.post('/api/admin/services', payload)).data;
    },
    onSuccess: () => {
      setForm(empty); setImage(null); setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'services'] });
      qc.invalidateQueries({ queryKey: ['public', 'services'] });
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/services/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Services / Products</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); setError(null); save.mutate(); }} className="card space-y-3">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit' : 'Tambah'} Layanan</h2>
          <div><label className="label">Nama</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><label className="label">Deskripsi Singkat</label><input className="input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></div>
          <div><label className="label">Deskripsi Lengkap</label><textarea className="input h-28" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Harga (opsional)</label><input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><label className="label">Currency</label><input className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Urutan</label><input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif</label></div>
          </div>
          <MediaPicker value={image} onSelect={(m) => { setImage(m); setForm({ ...form, imageId: m?.id ?? null }); }} label="Gambar" />
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-2"><button className="btn-primary">{editingId ? 'Update' : 'Tambah'}</button>{editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(empty); setImage(null); }}>Batal</button>}</div>
        </form>
        <div className="card space-y-2 lg:max-h-[80vh] lg:overflow-auto">
          {list.data?.map((s) => (
            <div key={s.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
              {s.image && <img src={s.image.url} alt={s.name} className="h-16 w-16 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-slate-500">/{s.slug} · {s.active ? 'Aktif' : 'Nonaktif'} · #{s.sortOrder}</div>
                {s.shortDescription && <div className="mt-1 text-sm text-slate-600">{s.shortDescription}</div>}
              </div>
              <div className="space-x-2">
                <button className="text-xs text-brand-600 hover:underline" onClick={() => {
                  setEditingId(s.id); setImage(s.image ?? null);
                  setForm({ name: s.name, slug: s.slug, shortDescription: s.shortDescription ?? '', description: s.description ?? '', imageId: s.image?.id ?? null, price: s.price ? String(s.price) : '', currency: s.currency ?? 'IDR', active: s.active, sortOrder: s.sortOrder });
                }}>Edit</button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus "${s.name}"?`)) del.mutate(s.id); }}>Hapus</button>
              </div>
            </div>
          ))}
          {list.data?.length === 0 && <p className="py-6 text-center text-slate-500">Belum ada layanan.</p>}
        </div>
      </div>
    </div>
  );
}
