import { useState } from 'react';
import { api, apiErrorMessage } from '../../lib/api';
import { useSite } from '../../hooks/useSite';

export function ContactPage() {
  const { data: site } = useSite();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await api.post('/api/public/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Hubungi Kami</h1>
        <p className="mt-2 text-slate-600">Punya pertanyaan? Kirim pesan dan tim kami akan segera membalas.</p>
        {site && (
          <div className="mt-6 space-y-2 text-slate-700">
            {site.profile.address && <div>📍 {site.profile.address}</div>}
            {site.profile.phone && <div>📞 {site.profile.phone}</div>}
            {site.profile.email && <div>✉️ {site.profile.email}</div>}
          </div>
        )}
      </div>
      <form onSubmit={onSubmit} className="card space-y-3">
        <div>
          <label className="label">Nama</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Nomor Telepon (opsional)</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div>
          <label className="label">Pesan</label>
          <textarea className="input h-32" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={status === 'sending'}>
          {status === 'sending' ? 'Mengirim…' : 'Kirim Pesan'}
        </button>
        {status === 'success' && <p className="text-sm text-green-700">Pesan terkirim. Terima kasih!</p>}
        {status === 'error' && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </div>
  );
}
