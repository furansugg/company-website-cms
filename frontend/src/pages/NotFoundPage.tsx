import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-slate-800">404</h1>
      <p className="text-slate-600">Halaman tidak ditemukan.</p>
      <Link to="/" className="btn-primary">Kembali ke beranda</Link>
    </div>
  );
}
