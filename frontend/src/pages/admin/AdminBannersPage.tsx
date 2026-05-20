import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Banner, Media } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';

interface FormState {
  title: string; subtitle: string; imageId: number | null;
  ctaText: string; ctaLink: string; active: boolean; sortOrder: number;
}
const empty: FormState = { title: '', subtitle: '', imageId: null, ctaText: '', ctaLink: '', active: true, sortOrder: 0 };

export function AdminBannersPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: async (): Promise<Banner[]> => (await api.get('/api/admin/banners')).data,
  });
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [image, setImage] = useState<Media | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) return (await api.put(`/api/admin/banners/${editingId}`, form)).data;
      return (await api.post('/api/admin/banners', form)).data;
    },
    onSuccess: () => {
      setForm(empty); setImage(null); setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
      qc.invalidateQueries({ queryKey: ['public', 'banners'] });
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/banners/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Banners</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); setError(null); save.mutate(); }} className="card space-y-3">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit' : 'Tambah'} Banner</h2>
          <div><label className="label">Judul</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Subtitle</label><input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div><label className="label">CTA Text</label><input className="input" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
          <div><label className="label">CTA Link</label><input className="input" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/contact atau https://…" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Urutan</label><input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif</label></div>
          </div>
          <MediaPicker value={image} onSelect={(m) => { setImage(m); setForm({ ...form, imageId: m?.id ?? null }); }} label="Gambar Banner" />
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-2"><button className="btn-primary">{editingId ? 'Update' : 'Tambah'}</button>{editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(empty); setImage(null); }}>Batal</button>}</div>
        </form>
        <div className="card space-y-2 lg:max-h-[80vh] lg:overflow-auto">
          {list.data?.map((b) => (
            <div key={b.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
              {b.image && <img src={b.image.url} alt={b.title} className="h-16 w-24 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-slate-500">{b.active ? 'Aktif' : 'Nonaktif'} · #{b.sortOrder}</div>
                {b.subtitle && <div className="mt-1 text-sm text-slate-600">{b.subtitle}</div>}
              </div>
              <div className="space-x-2">
                <button className="text-xs text-brand-600 hover:underline" onClick={() => {
                  setEditingId(b.id); setImage(b.image ?? null);
                  setForm({ title: b.title, subtitle: b.subtitle ?? '', imageId: b.image?.id ?? null, ctaText: b.ctaText ?? '', ctaLink: b.ctaLink ?? '', active: b.active, sortOrder: b.sortOrder });
                }}>Edit</button>
                <button className="text-xs text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus "${b.title}"?`)) del.mutate(b.id); }}>Hapus</button>
              </div>
            </div>
          ))}
          {list.data?.length === 0 && <p className="py-6 text-center text-slate-500">Belum ada banner.</p>}
        </div>
      </div>
    </div>
  );
}
