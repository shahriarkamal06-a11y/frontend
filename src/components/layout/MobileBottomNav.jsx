import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  Store,
  Package,
  Grid3X3,
  Menu,
  X
} from 'lucide-react';
import { useCartStore, useAuthStore, useWishlistStore } from '../../store';

const MobileBottomNav = () => {
  const location = useLocation();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const mainNavItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/products', icon: Grid3X3, label: 'Shop' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { to: isAuthenticated ? '/profile' : '/login', icon: User, label: isAuthenticated ? 'Profile' : 'Account' }
  ];

  const moreMenuItems = [
    { to: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistItems.length },
    { to: '/orders', icon: Package, label: 'My Orders' },
    { to: '/products', icon: Store, label: 'Categories' },
    { to: '/about', icon: Store, label: 'About Us' },
    { to: '/contact', icon: Store, label: 'Contact' },
    { to: '/help', icon: Store, label: 'Help Center' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white pb-safe hidden"> {/* We do not want to use bottom navbar sor a limitale time , please do not made any change on it*/}
        <div className="flex items-center justify-around">
          {mainNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors relative ${
                isActive(item.to) ? 'text-violet-600' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              {isActive(item.to) && (
                <Motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-600 rounded-full"
                />
              )}
            </Link>
          ))}
          
          {/* More Menu Button */}
          <button
            onClick={() => setShowMenu(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-slate-500"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Drawer */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-[60] lg:hidden"
          onClick={() => setShowMenu(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Menu Panel */}
          <Motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Menu</h2>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {moreMenuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMenu(false)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-violet-600" />
                    </div>
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Safe Area Spacer */}
            <div className="h-safe-area-inset-bottom" />
          </Motion.div>
        </div>
      )}

      {/* Spacer for fixed bottom nav */}
      <div className="h-[calc(64px+env(safe-area-inset-bottom))] lg:hidden" />
    </>
  );
};

export default MobileBottomNav;
