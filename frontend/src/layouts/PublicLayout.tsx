import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSite } from '../hooks/useSite';

export function PublicLayout() {
  const { data } = useSite();
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const siteName = data?.settings.siteName || 'Company Website';

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
            {data?.settings.logo ? (
              <img src={data.settings.logo.url} alt={siteName} className="h-9 w-9 rounded" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded bg-brand-600 text-white">
                {siteName.charAt(0)}
              </span>
            )}
            <span>{siteName}</span>
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'text-brand-700 font-semibold' : 'text-slate-700 hover:text-brand-600'}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-brand-700 font-semibold' : 'text-slate-700 hover:text-brand-600'}>About</NavLink>
            <NavLink to="/services" className={({ isActive }) => isActive ? 'text-brand-700 font-semibold' : 'text-slate-700 hover:text-brand-600'}>Services</NavLink>
            <NavLink to="/blog" className={({ isActive }) => isActive ? 'text-brand-700 font-semibold' : 'text-slate-700 hover:text-brand-600'}>Blog</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-brand-700 font-semibold' : 'text-slate-700 hover:text-brand-600'}>Contact</NavLink>
          </nav>
          <form onSubmit={onSearch} className="hidden md:block">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari…"
              className="input w-56"
            />
          </form>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row">
          <div>
            <div className="font-semibold text-slate-800">{siteName}</div>
            <div>{data?.settings.footerText || '© ' + new Date().getFullYear() + ' All rights reserved.'}</div>
          </div>
          <div className="flex gap-4">
            {data?.profile.email && <a href={`mailto:${data.profile.email}`} className="hover:text-brand-600">{data.profile.email}</a>}
            {data?.profile.phone && <span>{data.profile.phone}</span>}
            <Link to="/admin" className="hover:text-brand-600">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
