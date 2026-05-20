import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { CompanyProfile, Media } from '../../lib/types';
import { MediaPicker } from '../../components/MediaPicker';

interface FormState {
  name: string; tagline: string; description: string;
  vision: string; mission: string; address: string; phone: string; email: string;
  logoId: number | null;
  facebookUrl: string; instagramUrl: string; twitterUrl: string; linkedinUrl: string; youtubeUrl: string;
}
const empty: FormState = { name: '', tagline: '', description: '', vision: '', mission: '', address: '', phone: '', email: '', logoId: null, facebookUrl: '', instagramUrl: '', twitterUrl: '', linkedinUrl: '', youtubeUrl: '' };

export function AdminCompanyProfilePage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: async (): Promise<CompanyProfile> => (await api.get('/api/admin/company-profile')).data,
  });
  const [form, setForm] = useState<FormState>(empty);
  const [logo, setLogo] = useState<Media | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name, tagline: data.tagline ?? '', description: data.description ?? '',
        vision: data.vision ?? '', mission: data.mission ?? '', address: data.address ?? '',
        phone: data.phone ?? '', email: data.email ?? '', logoId: data.logo?.id ?? null,
        facebookUrl: data.facebookUrl ?? '', instagramUrl: data.instagramUrl ?? '',
        twitterUrl: data.twitterUrl ?? '', linkedinUrl: data.linkedinUrl ?? '',
        youtubeUrl: data.youtubeUrl ?? '',
      });
      setLogo(data.logo ?? null);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => (await api.put('/api/admin/company-profile', form)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'profile'] });
      qc.invalidateQueries({ queryKey: ['public', 'site'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e) => setError(apiErrorMessage(e)),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(null); save.mutate(); }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <button className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Menyimpan…' : 'Simpan'}</button>
      </div>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {saved && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Tersimpan.</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3">
          <div><label className="label">Nama Perusahaan</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div><label className="label">Deskripsi</label><textarea className="input h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="label">Visi</label><textarea className="input h-20" value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} /></div>
          <div><label className="label">Misi</label><textarea className="input h-24" value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} /></div>
          <MediaPicker value={logo} onSelect={(m) => { setLogo(m); setForm({ ...form, logoId: m?.id ?? null }); }} label="Logo" />
        </div>
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Kontak & Sosial Media</h2>
          <div><label className="label">Alamat</label><textarea className="input h-20" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="label">Telepon</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
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
