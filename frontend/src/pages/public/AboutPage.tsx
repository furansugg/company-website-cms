import { useSite } from '../../hooks/useSite';

export function AboutPage() {
  const { data } = useSite();
  if (!data) return <div className="mx-auto max-w-4xl px-4 py-12">Memuat…</div>;
  const p = data.profile;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">{p.name}</h1>
      {p.tagline && <p className="mt-2 text-lg text-slate-600">{p.tagline}</p>}
      {p.description && <p className="mt-6 leading-7 text-slate-700">{p.description}</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {p.vision && (
          <div className="card">
            <h2 className="text-xl font-semibold">Visi</h2>
            <p className="mt-2 text-slate-700">{p.vision}</p>
          </div>
        )}
        {p.mission && (
          <div className="card">
            <h2 className="text-xl font-semibold">Misi</h2>
            <p className="mt-2 whitespace-pre-line text-slate-700">{p.mission}</p>
          </div>
        )}
      </div>
      <div className="mt-8 card">
        <h2 className="text-xl font-semibold">Kontak</h2>
        <ul className="mt-2 space-y-1 text-slate-700">
          {p.address && <li>📍 {p.address}</li>}
          {p.phone && <li>📞 {p.phone}</li>}
          {p.email && <li>✉️ {p.email}</li>}
        </ul>
      </div>
    </div>
  );
}
