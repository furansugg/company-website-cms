import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { hasRole, useAuthStore, type Role } from '../stores/auth';
import { api } from '../lib/api';

interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: '/admin',                 label: 'Dashboard' },
  { to: '/admin/pages',           label: 'Pages',     roles: ['SUPER_ADMIN','ADMIN'] },
  { to: '/admin/articles',        label: 'Articles' },
  { to: '/admin/categories',      label: 'Categories' },
  { to: '/admin/tags',            label: 'Tags' },
  { to: '/admin/media',           label: 'Media' },
  { to: '/admin/company-profile', label: 'Company Profile', roles: ['SUPER_ADMIN','ADMIN'] },
  { to: '/admin/services',        label: 'Services',        roles: ['SUPER_ADMIN','ADMIN'] },
  { to: '/admin/banners',         label: 'Banners',         roles: ['SUPER_ADMIN','ADMIN'] },
  { to: '/admin/messages',        label: 'Messages',        roles: ['SUPER_ADMIN','ADMIN'] },
  { to: '/admin/menus',           label: 'Menus',           roles: ['SUPER_ADMIN','ADMIN'] },
  { to: '/admin/settings',        label: 'Website Settings',roles: ['SUPER_ADMIN'] },
  { to: '/admin/users',           label: 'Users',           roles: ['SUPER_ADMIN'] },
  { to: '/admin/audit-logs',      label: 'Audit Log',       roles: ['SUPER_ADMIN'] },
];

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout', {}); } catch { /* ignore */ }
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Link to="/admin" className="mb-6 text-lg font-bold text-brand-700">CMS Admin</Link>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.filter((n) => !n.roles || hasRole(user, n.roles)).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/admin'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700 hover:bg-slate-100'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="text-sm text-slate-500">Signed in as <span className="font-medium text-slate-800">{user?.fullName}</span> · {user?.role}</div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-sm text-brand-600 hover:underline">View site →</Link>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
