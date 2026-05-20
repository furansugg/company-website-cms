import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';
import type { Media, PageResponse } from '../lib/types';

interface Props {
  value?: Media | null;
  onSelect: (media: Media | null) => void;
  label?: string;
}

export function MediaPicker({ value, onSelect, label = 'Featured Image' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="flex items-center gap-3">
            <img src={value.url} alt={value.originalName} className="h-16 w-16 rounded-lg object-cover" />
            <div>
              <div className="text-sm font-medium">{value.originalName}</div>
              <button type="button" onClick={() => onSelect(null)} className="text-xs text-red-600 hover:underline">Hapus</button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Belum ada media dipilih.</div>
        )}
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary">Pilih</button>
      </div>
      {open && <MediaPickerDialog onClose={() => setOpen(false)} onSelect={(m) => { onSelect(m); setOpen(false); }} />}
    </div>
  );
}

function MediaPickerDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (m: Media) => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'media-picker'],
    queryFn: async (): Promise<PageResponse<Media>> => (await api.get('/api/admin/media', { params: { size: 50 } })).data,
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return (await api.post<Media>('/api/admin/media', fd)).data;
    },
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: ['admin', 'media-picker'] });
      qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      onSelect(m);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pilih Media</h2>
          <label className="btn-secondary cursor-pointer">
            Upload
            <input
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }}
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {data?.content.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="overflow-hidden rounded-lg border border-slate-200 hover:border-brand-500"
            >
              {m.fileType.startsWith('image/')
                ? <img src={m.url} alt={m.originalName} className="h-24 w-full object-cover" />
                : <div className="grid h-24 w-full place-items-center bg-slate-100 text-xs text-slate-500">{m.fileType}</div>}
              <div className="truncate p-2 text-left text-xs text-slate-600">{m.originalName}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
