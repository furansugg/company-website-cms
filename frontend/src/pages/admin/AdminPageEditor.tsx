import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Page, PublishStatus } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';

interface FormState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  status: PublishStatus;
  featuredImageId: number | null;
}

const empty: FormState = { title: '', slug: '', content: '', excerpt: '', metaTitle: '', metaDescription: '', status: 'DRAFT', featuredImageId: null };

export function AdminPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const editing = !!id && id !== 'new';
  const [form, setForm] = useState<FormState>(empty);
  const [featuredImageMedia, setFeaturedImageMedia] = useState<Page['featuredImage']>(null);
  const [error, setError] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['admin', 'page', id],
    queryFn: async (): Promise<Page> => (await api.get(`/api/admin/pages/${id}`)).data,
    enabled: editing,
  });

  useEffect(() => {
    if (detail.data) {
      const p = detail.data;
      setForm({
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt ?? '',
        metaTitle: p.metaTitle ?? '',
        metaDescription: p.metaDescription ?? '',
        status: p.status,
        featuredImageId: p.featuredImage?.id ?? null,
      });
      setFeaturedImageMedia(p.featuredImage ?? null);
    }
  }, [detail.data]);

  const save = useMutation({
    mutationFn: async (payload: FormState) => {
      if (editing) return (await api.put<Page>(`/api/admin/pages/${id}`, payload)).data;
      return (await api.post<Page>('/api/admin/pages', payload)).data;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['admin', 'pages'] });
      navigate(`/admin/pages/${p.id}`, { replace: true });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate(form);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{editing ? 'Edit Halaman' : 'Halaman Baru'}</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Batal</button>
          <button className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </div>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card space-y-3">
            <div>
              <label className="label">Judul</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Slug (opsional, generated dari judul)</label>
              <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="contoh: tentang-kami" />
            </div>
            <div>
              <label className="label">Excerpt (ringkasan)</label>
              <textarea className="input h-20" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div>
              <label className="label">Konten (HTML atau plain text)</label>
              <textarea className="input h-64 font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
          </div>
          <div className="card space-y-3">
            <h2 className="text-lg font-semibold">SEO</h2>
            <div>
              <label className="label">Meta Title</label>
              <input className="input" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </div>
            <div>
              <label className="label">Meta Description</label>
              <textarea className="input h-20" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card space-y-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PublishStatus })}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <MediaPicker
              value={featuredImageMedia ?? null}
              onSelect={(m) => { setFeaturedImageMedia(m); setForm({ ...form, featuredImageId: m?.id ?? null }); }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
