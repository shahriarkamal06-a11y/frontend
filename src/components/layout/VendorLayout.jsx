import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Settings, BarChart3,
  Wallet, HelpCircle, Store, Menu, Bell, Search, ChevronDown, LogOut, DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store';

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/vendor' },
    { icon: Package, label: 'Products', to: '/vendor/products' },
    { icon: ShoppingCart, label: 'Orders', to: '/vendor/orders' },
    { icon: BarChart3, label: 'Analytics', to: '/vendor/analytics' },
    { icon: Wallet, label: 'Payouts', to: '/vendor/payouts' },
    { icon: HelpCircle, label: 'Support', to: '/vendor/support' },
    { icon: Settings, label: 'Settings', to: '/vendor/settings' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white flex-shrink-0 transition-all duration-300 hidden lg:flex flex-col fixed h-full z-20`}>
        {/* Logo */}
        <div className="p-6">
          <Link to="/vendor" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Store className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Vendor</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(link.to)
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <link.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Quick Stats */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-slate-700/50">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">$12,450</span>
              </div>
              <p className="text-xs text-slate-400">Total Earnings</p>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="p-4 border-t border-slate-700/50">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-medium text-sm">
              {user?.name?.charAt(0) || 'V'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Vendor'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'vendor@example.com'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 h-6 w-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3 w-3 rotate-90" />
          </motion.div>
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 h-full w-70 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-40 lg:hidden"
            >
              <div className="p-6">
                <Link to="/vendor" className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">Vendor</span>
                </Link>
              </div>
              <nav className="px-4 py-4 space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(link.to)
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span>Vendor</span>
              <span>/</span>
              <span className="text-slate-900 font-medium capitalize">
                {location.pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
