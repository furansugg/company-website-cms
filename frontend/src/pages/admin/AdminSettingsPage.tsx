import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { Media, WebsiteSettings } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';

interface FormState {
  siteName: string; logoId: number | null; faviconId: number | null;
  primaryColor: string; footerText: string; contactEmail: string;
  facebookUrl: string; instagramUrl: string; twitterUrl: string; linkedinUrl: string; youtubeUrl: string;
  defaultMetaTitle: string; defaultMetaDescription: string; ogImageId: number | null; robotsTxt: string;
}
const empty: FormState = {
  siteName: '', logoId: null, faviconId: null, primaryColor: '#3179ff', footerText: '', contactEmail: '',
  facebookUrl: '', instagramUrl: '', twitterUrl: '', linkedinUrl: '', youtubeUrl: '',
  defaultMetaTitle: '', defaultMetaDescription: '', ogImageId: null, robotsTxt: 'User-agent: *\nAllow: /\n',
};

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async (): Promise<WebsiteSettings> => (await api.get('/api/admin/settings')).data,
  });
  const [form, setForm] = useState<FormState>(empty);
  const [logo, setLogo] = useState<Media | null>(null);
  const [favicon, setFavicon] = useState<Media | null>(null);
  const [ogImage, setOgImage] = useState<Media | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        siteName: data.siteName, logoId: data.logo?.id ?? null, faviconId: data.favicon?.id ?? null,
        primaryColor: data.primaryColor ?? '#3179ff', footerText: data.footerText ?? '',
        contactEmail: data.contactEmail ?? '',
        facebookUrl: data.facebookUrl ?? '', instagramUrl: data.instagramUrl ?? '',
        twitterUrl: data.twitterUrl ?? '', linkedinUrl: data.linkedinUrl ?? '',
        youtubeUrl: data.youtubeUrl ?? '',
        defaultMetaTitle: data.defaultMetaTitle ?? '', defaultMetaDescription: data.defaultMetaDescription ?? '',
        ogImageId: data.ogImage?.id ?? null, robotsTxt: data.robotsTxt ?? 'User-agent: *\nAllow: /\n',
      });
      setLogo(data.logo ?? null); setFavicon(data.favicon ?? null); setOgImage(data.ogImage ?? null);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => (await api.put('/api/admin/settings', form)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['public', 'site'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(null); save.mutate(); }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Website Settings</h1>
        <button className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Menyimpan…' : 'Simpan'}</button>
      </div>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {saved && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Tersimpan.</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Identitas</h2>
          <div><label className="label">Nama Website</label><input className="input" required value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} /></div>
          <div><label className="label">Footer Text</label><input className="input" value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} /></div>
          <div><label className="label">Contact Email</label><input className="input" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
          <div><label className="label">Primary Color</label><input className="input" type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} /></div>
          <MediaPicker value={logo} onSelect={(m) => { setLogo(m); setForm({ ...form, logoId: m?.id ?? null }); }} label="Logo" />
          <MediaPicker value={favicon} onSelect={(m) => { setFavicon(m); setForm({ ...form, faviconId: m?.id ?? null }); }} label="Favicon" />
        </div>
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">SEO & Social</h2>
          <div><label className="label">Default Meta Title</label><input className="input" value={form.defaultMetaTitle} onChange={(e) => setForm({ ...form, defaultMetaTitle: e.target.value })} /></div>
          <div><label className="label">Default Meta Description</label><textarea className="input h-20" value={form.defaultMetaDescription} onChange={(e) => setForm({ ...form, defaultMetaDescription: e.target.value })} /></div>
          <MediaPicker value={ogImage} onSelect={(m) => { setOgImage(m); setForm({ ...form, ogImageId: m?.id ?? null }); }} label="Open Graph Image" />
          <div><label className="label">robots.txt</label><textarea className="input h-28 font-mono text-sm" value={form.robotsTxt} onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })} /></div>
          {(['facebookUrl', 'instagramUrl', 'twitterUrl', 'linkedinUrl', 'youtubeUrl'] as const).map((k) => (
            <div key={k}>
              <label className="label">{k.replace('Url', '')}</label>
              <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder="https://" />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
