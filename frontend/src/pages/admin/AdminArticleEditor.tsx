import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Article, ArticleStatus, Category, Media, Tag } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';
import { hasRole, useAuthStore } from '../../stores/auth';

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number | null;
  featuredImageId: number | null;
  status: ArticleStatus;
  metaTitle: string;
  metaDescription: string;
  tagIds: number[];
}

const empty: FormState = {
  title: '', slug: '', excerpt: '', content: '', categoryId: null,
  featuredImageId: null, status: 'DRAFT', metaTitle: '', metaDescription: '', tagIds: [],
};

export function AdminArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canPublish = hasRole(user, ['SUPER_ADMIN', 'ADMIN']);
  const editing = !!id && id !== 'new';
  const [form, setForm] = useState<FormState>(empty);
  const [featuredMedia, setFeaturedMedia] = useState<Media | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: async (): Promise<Article> => (await api.get(`/api/admin/articles/${id}`)).data,
    enabled: editing,
  });
  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<Category[]> => (await api.get('/api/admin/categories')).data,
  });
  const tags = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: async (): Promise<Tag[]> => (await api.get('/api/admin/tags')).data,
  });

  useEffect(() => {
    if (detail.data) {
      const a = detail.data;
      setForm({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? '',
        content: a.content,
        categoryId: a.categoryId ?? null,
        featuredImageId: a.featuredImage?.id ?? null,
        status: a.status,
        metaTitle: a.metaTitle ?? '',
        metaDescription: a.metaDescription ?? '',
        tagIds: a.tags.map((t) => t.id),
      });
      setFeaturedMedia(a.featuredImage ?? null);
    }
  }, [detail.data]);

  const save = useMutation({
    mutationFn: async (payload: FormState) => {
      if (editing) return (await api.put<Article>(`/api/admin/articles/${id}`, payload)).data;
      return (await api.post<Article>('/api/admin/articles', payload)).data;
    },
    onSuccess: (a) => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      navigate(`/admin/articles/${a.id}`, { replace: true });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const submitForReview = useMutation({
    mutationFn: async () => (await api.post<Article>(`/api/admin/articles/${id}/submit`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'article', id] }),
  });
  const publish = useMutation({
    mutationFn: async () => (await api.post<Article>(`/api/admin/articles/${id}/publish`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'article', id] }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate(form);
  };

  const toggleTag = (tagId: number) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId) ? f.tagIds.filter((x) => x !== tagId) : [...f.tagIds, tagId],
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{editing ? 'Edit Artikel' : 'Artikel Baru'}</h1>
        <div className="flex gap-2">
          {editing && form.status === 'DRAFT' && <button type="button" className="btn-secondary" onClick={() => submitForReview.mutate()}>Submit Review</button>}
          {editing && canPublish && form.status !== 'PUBLISHED' && form.status !== 'ARCHIVED' && (
            <button type="button" className="btn-secondary" onClick={() => publish.mutate()}>Publish</button>
          )}
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
              <label className="label">Slug (opsional)</label>
              <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className="label">Excerpt</label>
              <textarea className="input h-20" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </div>
            <div>
              <label className="label">Konten</label>
              <textarea className="input h-72 font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
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
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ArticleStatus })} disabled={!canPublish && form.status === 'PUBLISHED'}>
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">Review</option>
                {canPublish && <option value="PUBLISHED">Published</option>}
                {canPublish && <option value="ARCHIVED">Archived</option>}
              </select>
              {!canPublish && <p className="mt-1 text-xs text-slate-500">Editor hanya bisa Draft/Review. Admin yang akan publish.</p>}
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={form.categoryId ?? ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value === '' ? null : Number(e.target.value) })}>
                <option value="">— Tanpa Kategori —</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <MediaPicker
              value={featuredMedia}
              onSelect={(m) => { setFeaturedMedia(m); setForm({ ...form, featuredImageId: m?.id ?? null }); }}
            />
          </div>
          <div className="card">
            <label className="label">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.data?.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`badge ${form.tagIds.includes(t.id) ? 'badge-green' : 'badge-gray'}`}
                >
                  #{t.name}
                </button>
              ))}
              {tags.data?.length === 0 && <p className="text-sm text-slate-500">Belum ada tag. Tambahkan dari menu Tags.</p>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
