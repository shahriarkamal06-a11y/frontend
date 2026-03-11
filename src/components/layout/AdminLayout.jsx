import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tags,
  Star,
  Store,
  Menu,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileBarChart,
  FileText,
  Activity,
  Megaphone,
  BookOpen,
  Layers,
  TicketCheck,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useStoreSettingsStore } from '../../store';

const baseNavigationGroups = [
  {
    title: 'Commerce',
    links: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
      { icon: Package, label: 'Products', to: '/admin/products' },
      { icon: ShoppingCart, label: 'Orders', to: '/admin/orders' },
      { icon: Users, label: 'Customers', to: '/admin/customers' },
      { icon: TicketCheck, label: 'Coupons', to: '/admin/coupons' },
      { icon: Tags, label: 'Categories', to: '/admin/categories' },
      { icon: Star, label: 'Reviews', to: '/admin/reviews' },
    ],
  },
  {
    title: 'Growth',
    links: [
      { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
      { icon: FileBarChart, label: 'Reports', to: '/admin/reports' },
      { icon: Megaphone, label: 'Announcements', to: '/admin/announcements' },
      { icon: BookOpen, label: 'Blog', to: '/admin/blog' },
      { icon: FileText, label: 'Content', to: '/admin/content' },
    ],
  },
  {
    title: 'System',
    links: [
      { icon: Layers, label: 'Sections', to: '/admin/sections' },
      { icon: Activity, label: 'System Logs', to: '/admin/logs' },
      { icon: Settings, label: 'Store Settings', to: '/admin/store-settings' },
    ],
  },
];

const formatSegment = (segment) => {
  if (!segment) return 'Dashboard';
  return segment
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { store, loadSettings } = useStoreSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const pathSegments = useMemo(
    () => location.pathname.split('/').filter(Boolean).slice(1),
    [location.pathname]
  );

  const navigationGroups = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN') {
      return [
        ...baseNavigationGroups,
        {
          title: 'Platform',
          links: [
            { icon: Store, label: 'Stores', to: '/super-admin/stores' },
          ],
        },
      ];
    }

    return baseNavigationGroups;
  }, [user?.role]);

  const pageTitle = formatSegment(pathSegments[pathSegments.length - 1] || 'dashboard');

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isFormPage = useMemo(
    () => {
      const path = location.pathname;
      if (path.includes('/new') || path.includes('/edit')) return true;
      const modalFormPages = ['/admin/coupons', '/admin/categories', '/admin/announcements'];
      return modalFormPages.some(page => path === page);
    },
    [location.pathname]
  );

  const initials = useMemo(
    () =>
      user?.name
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AD',
    [user?.name]
  );

  return (
    <div className="admin-shell min-h-screen flex">
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'w-72' : 'w-24'} hidden lg:flex fixed left-0 top-0 h-full z-30 transition-all duration-300`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="admin-sidebar-card p-3 mb-4">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <Store className="h-5 w-5" />
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{store?.name} Admin</p>
                  <p className="text-xs text-slate-500 truncate">Control center</p>
                </div>
              )}
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {navigationGroups.map((group) => (
              <div key={group.title} className="mb-5">
                {sidebarOpen && (
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </p>
                )}
                <nav className="space-y-1">
                  {group.links.map((link) => {
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`admin-nav-link ${active ? 'admin-nav-link-active' : ''} ${sidebarOpen ? '' : 'justify-center px-2'}`}
                        title={sidebarOpen ? undefined : link.label}
                      >
                        <link.icon className="h-4 w-4 flex-shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium truncate">{link.label}</span>}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="admin-sidebar-card p-3 mt-2">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={logout}
                className="mt-3 w-full admin-secondary-btn text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="admin-sidebar-toggle"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Motion.div>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/35 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <Motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed left-0 top-0 h-full w-80 admin-sidebar z-50 p-4 lg:hidden"
            >
              <div className="admin-sidebar-card p-3 mb-4 flex items-center justify-between">
                <Link to="/admin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{store?.name} Admin</p>
                    <p className="text-xs text-slate-500">Control center</p>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4 mx-auto" />
                </button>
              </div>

              <div className="overflow-y-auto h-[calc(100%-5rem)] pr-1">
                {navigationGroups.map((group) => (
                  <div key={group.title} className="mb-5">
                    <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {group.title}
                    </p>
                    <nav className="space-y-1">
                      {group.links.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`admin-nav-link ${isActive(link.to) ? 'admin-nav-link-active' : ''}`}
                        >
                          <link.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{link.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                ))}
              </div>
            </Motion.aside>
          </>
        )}
      </AnimatePresence>

      {!mobileMenuOpen && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="fixed bottom-4 left-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg shadow-slate-950/10 backdrop-blur lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-24'}`}>
        

        

        <main className="admin-main min-w-0 flex-1 overflow-x-hidden px-4 py-5 lg:px-8 lg:py-8">
          <div className="admin-page-shell min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
