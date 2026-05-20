import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, apiErrorMessage } from '../../lib/api';
import { useAuthStore, type AuthUser } from '../../stores/auth';

interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: AuthUser;
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('super.admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
      setSession(res.data.token, res.data.user);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">CMS Login</h1>
        <p className="text-sm text-slate-500">Masuk untuk mengelola konten website Anda.</p>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Memproses…' : 'Login'}</button>
        <div className="text-center text-sm text-slate-500">
          <Link to="/" className="hover:text-brand-600">← Kembali ke beranda</Link>
        </div>
      </form>
    </div>
  );
}
