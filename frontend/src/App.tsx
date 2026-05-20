import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore, hasRole, type Role } from './stores/auth';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { BlogListPage } from './pages/public/BlogListPage';
import { BlogDetailPage } from './pages/public/BlogDetailPage';
import { ContactPage } from './pages/public/ContactPage';
import { SearchPage } from './pages/public/SearchPage';
import { PublicPagePage } from './pages/public/PublicPagePage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AdminPagesPage } from './pages/admin/AdminPagesPage';
import { AdminPageEditor } from './pages/admin/AdminPageEditor';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminArticleEditor } from './pages/admin/AdminArticleEditor';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminTagsPage } from './pages/admin/AdminTagsPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminCompanyProfilePage } from './pages/admin/AdminCompanyProfilePage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminMenusPage } from './pages/admin/AdminMenusPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { NotFoundPage } from './pages/NotFoundPage';

function RequireAuth({ allow, children }: { allow?: Role[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!token || !user) return <Navigate to="/admin/login" replace />;
  if (allow && !hasRole(user, allow)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/page/:slug" element={<PublicPagePage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="pages" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminPagesPage /></RequireAuth>} />
        <Route path="pages/new" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminPageEditor /></RequireAuth>} />
        <Route path="pages/:id" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminPageEditor /></RequireAuth>} />
        <Route path="articles" element={<AdminArticlesPage />} />
        <Route path="articles/new" element={<AdminArticleEditor />} />
        <Route path="articles/:id" element={<AdminArticleEditor />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="tags" element={<AdminTagsPage />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="company-profile" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminCompanyProfilePage /></RequireAuth>} />
        <Route path="services" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminServicesPage /></RequireAuth>} />
        <Route path="banners" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminBannersPage /></RequireAuth>} />
        <Route path="messages" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminMessagesPage /></RequireAuth>} />
        <Route path="menus" element={<RequireAuth allow={['SUPER_ADMIN', 'ADMIN']}><AdminMenusPage /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth allow={['SUPER_ADMIN']}><AdminSettingsPage /></RequireAuth>} />
        <Route path="users" element={<RequireAuth allow={['SUPER_ADMIN']}><AdminUsersPage /></RequireAuth>} />
        <Route path="audit-logs" element={<RequireAuth allow={['SUPER_ADMIN']}><AdminAuditLogPage /></RequireAuth>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
