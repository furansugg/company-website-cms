import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Service } from '../../lib/types';

export function ServicesPage() {
  const { data } = useQuery({
    queryKey: ['public', 'services'],
    queryFn: async (): Promise<Service[]> => (await api.get('/api/public/services')).data,
  });
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Layanan Kami</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((s) => (
          <div key={s.id} className="card">
            {s.image && <img src={s.image.url} alt={s.name} className="mb-3 h-40 w-full rounded-lg object-cover" />}
            <h2 className="text-lg font-semibold">{s.name}</h2>
            {s.shortDescription && <p className="mt-1 text-slate-600">{s.shortDescription}</p>}
            {s.description && <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{s.description}</p>}
            {s.price && <div className="mt-3 text-brand-700 font-semibold">{(s.currency || 'IDR') + ' ' + Number(s.price).toLocaleString('id-ID')}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
