import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import type { PageResponse, UserAccount } from '../../lib/types';

interface FormState { email: string; fullName: string; password: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'; status: 'ACTIVE' | 'DISABLED' }
const empty: FormState = { email: '', fullName: '', password: '', role: 'EDITOR', status: 'ACTIVE' };

export function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: async (): Promise<PageResponse<UserAccount>> => (await api.get('/api/admin/users', { params: { page } })).data,
  });

  const create = useMutation({
    mutationFn: async () => (await api.post('/api/admin/users', form)).data,
    onSuccess: () => { setForm(empty); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const update = useMutation({
    mutationFn: async () => (await api.put(`/api/admin/users/${editing!.id}`, { fullName: form.fullName, role: form.role, status: form.status })).data,
    onSuccess: () => { setEditing(null); setForm(empty); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => setError(apiErrorMessage(e)),
  });
  const reset = useMutation({
    mutationFn: async (args: { id: number; password: string }) => (await api.post(`/api/admin/users/${args.id}/reset-password`, { password: args.password })).data,
    onError: (e) => alert(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/admin/users/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={(e) => { e.preventDefault(); setError(null); editing ? update.mutate() : create.mutate(); }} className="card space-y-3">
          <h2 className="text-lg font-semibold">{editing ? 'Edit User' : 'Tambah User'}</h2>
          <div><label className="label">Email</label><input className="input" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Nama Lengkap</label><input className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          {!editing && <div><label className="label">Password</label><input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>}
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState['status'] })}>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
          {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-2">
            <button className="btn-primary">{editing ? 'Update' : 'Tambah'}</button>
            {editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm(empty); }}>Batal</button>}
          </div>
        </form>
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th></th></tr>
            </thead>
            <tbody>
              {list.data?.content.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3"><span className="badge badge-gray">{u.role}</span></td>
                  <td className="px-4 py-3"><span className={u.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>{u.status}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="text-xs text-brand-600 hover:underline" onClick={() => { setEditing(u); setForm({ email: u.email, fullName: u.fullName, password: '', role: u.role, status: u.status }); }}>Edit</button>
                    <button className="text-xs text-brand-600 hover:underline" onClick={() => { const p = prompt('Password baru (min 8 chars):'); if (p) reset.mutate({ id: u.id, password: p }); }}>Reset PW</button>
                    <button className="text-xs text-red-600 hover:underline" onClick={() => { if (confirm(`Hapus user "${u.email}"?`)) del.mutate(u.id); }}>Hapus</button>
                  </td>
                </tr>
              ))}
              {list.data?.content.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Belum ada user.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {list.data && list.data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: list.data.totalPages }).map((_, i) => (
            <button key={i} className={`badge ${i === page ? 'badge-green' : 'badge-gray'}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
