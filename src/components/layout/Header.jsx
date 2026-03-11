import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star as StarIcon,
  Store,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useAuthStore, useCartStore, useStoreSettingsStore, useUIStore, useWishlistStore } from '../../store';
import { AnnouncementBannerRegion } from '../announcement';
import { Button } from '../ui';
import { cn } from '../../utils';
import { categoryAPI } from '../../services/api';
import { normalizeCategory } from '../../hooks/useApi';
import { useInitialData } from '../../ssr/initial-data';
import { isExternalStoreLink } from '../../utils/storeSettings';
import { resolveHeaderStyle } from '../../utils/themeHelpers';
import { buildCategoryTree } from '../../utils/categoryTree';

const SmartStoreLink = ({ to, newTab = false, className, children, onClick, ...props }) => {
  if (isExternalStoreLink(to)) {
    return (
      <a
        href={to}
        className={className}
        onClick={onClick}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={className}
      onClick={onClick}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
      {...props}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = useInitialData();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { mobileMenuOpen, setMobileMenuOpen, toggleCart } = useUIStore();
  const store = useStoreSettingsStore((state) => state.store);
  const theme = useStoreSettingsStore((state) => state.theme);
  const initialCategories = useMemo(() => {
    const topLevel = initialData?.categories;
    if (Array.isArray(topLevel) && topLevel.length > 0) {
      return topLevel;
    }
    const routeCategories = initialData?.routeData?.categories;
    return Array.isArray(routeCategories) ? routeCategories : [];
  }, [initialData?.categories, initialData?.routeData?.categories]);
  const [categories, setCategories] = useState(() => initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openDesktopDropdownId, setOpenDesktopDropdownId] = useState('');
  const [expandedMobileNavIds, setExpandedMobileNavIds] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const navDropdownTimeout = useRef(null);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories]
  );
  const categoryTree = useMemo(
    () => buildCategoryTree(activeCategories, { includeInactive: false }),
    [activeCategories]
  );

  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
      return;
    }

    const loadCategories = async () => {
      try {
        const response = await categoryAPI.getCategories({ limit: 500, page: 1 });
        const items = response?.data?.data?.items || [];
        setCategories(items.map(normalizeCategory));
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, [initialCategories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMobileMenuOpen(false);
      setOpenDesktopDropdownId('');
      setExpandedMobileNavIds([]);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, setMobileMenuOpen]);

  useEffect(() => () => {
    clearTimeout(navDropdownTimeout.current);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setSearchFocused(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleDesktopDropdownEnter = (linkId) => {
    clearTimeout(navDropdownTimeout.current);
    setOpenDesktopDropdownId(linkId);
  };

  const handleDesktopDropdownLeave = () => {
    navDropdownTimeout.current = window.setTimeout(() => setOpenDesktopDropdownId(''), 180);
  };

  const toggleMobileNav = (linkId) => {
    setExpandedMobileNavIds((currentIds) => (
      currentIds.includes(linkId)
        ? currentIds.filter((currentId) => currentId !== linkId)
        : [...currentIds, linkId]
    ));
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemsCount = wishlistItems.length;
  const storeName = store.name || 'Store';
  const primaryCategory = categoryTree[0] || activeCategories[0];
  const categoryLink = primaryCategory?.slug ? `/categories/${primaryCategory.slug}` : '/products';
  const headerStyle = resolveHeaderStyle(theme?.headerStyle || 'modern');
  const navigation = store.navigation || {};
  const navLinks = (navigation.links || [])
    .filter((link) => link.isVisible !== false)
    .map((link) => ({
      ...link,
      to: link.type === 'categories' ? categoryLink : (link.to || (link.type === 'dropdown' ? '' : '/products')),
      children: (link.children || []).filter((childLink) => childLink.isVisible !== false),
      hasSubmenu: link.type === 'categories' || (link.children || []).some((childLink) => childLink.isVisible !== false),
    }));
  const activeDesktopDropdown = navLinks.find((link) => link.id === openDesktopDropdownId) || null;
  const isTransparentHeader = headerStyle === 'transparent';
  const isGlassHeader = headerStyle === 'glass';
  const isStackedHeader = ['stacked', 'magazine'].includes(headerStyle);
  const isLuxeHeader = headerStyle === 'luxe';
  const isCompactHeader = headerStyle === 'compact';
  const isUnderlineHeader = headerStyle === 'underline';

  const isDarkHeader = ['classic', 'contrast', 'bold', 'mono', 'luxe'].includes(headerStyle);
  const isFloatingHeader = ['floating', 'capsule', 'glass', 'boxed'].includes(headerStyle);
  const isCenteredHeader = ['centered', 'editorial', 'magazine', 'stacked'].includes(headerStyle);
  const isSplitHeader = ['split', 'storefront'].includes(headerStyle);
  const isCapsuleHeader = headerStyle === 'capsule';
  const isLightBlurHeader = isTransparentHeader || isGlassHeader;

  const surfaceClassName = cn(
    'relative transition-all duration-300',
    isFloatingHeader ? 'mx-auto max-w-[1400px] rounded-[28px] border shadow-2xl backdrop-blur' : 'border-b',
    isTransparentHeader && 'border-transparent bg-white/60 text-slate-900 backdrop-blur-md shadow-none',
    headerStyle === 'glass' && 'border-white/30 bg-white/35 text-slate-900 shadow-lg shadow-slate-200/60 backdrop-blur-xl',
    headerStyle === 'boxed' && 'border-slate-200 bg-white text-slate-900 shadow-xl',
    headerStyle === 'bold' && 'border-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-slate-950/40',
    headerStyle === 'mono' && 'border-slate-900 bg-black text-white shadow-black/40',
    headerStyle === 'luxe' && 'border-amber-500/15 bg-slate-950 text-amber-50 shadow-slate-950/50',
    headerStyle === 'magazine' && 'border-slate-200 bg-white text-slate-900 shadow-sm',
    headerStyle === 'stacked' && 'border-slate-200 bg-white text-slate-900 shadow-sm',
    headerStyle === 'underline' && 'border-slate-200 bg-white text-slate-900',
    headerStyle === 'classic' && 'border-slate-800 bg-slate-950 text-white shadow-slate-950/20',
    headerStyle === 'minimal' && 'border-slate-200 bg-white/95 text-slate-900 backdrop-blur',
    headerStyle === 'centered' && 'border-slate-200 bg-white text-slate-900 shadow-sm',
    headerStyle === 'floating' && 'border-slate-200/70 bg-white/90 text-slate-900 shadow-slate-200/70',
    headerStyle === 'contrast' && 'border-amber-400/10 bg-slate-950 text-white shadow-slate-950/30',
    headerStyle === 'editorial' && 'border-stone-200 bg-stone-50 text-slate-900 shadow-stone-200/70',
    headerStyle === 'capsule' && 'border-slate-200/70 bg-white/90 text-slate-900 shadow-slate-200/70',
    headerStyle === 'storefront' && 'border-emerald-100 bg-emerald-50/70 text-slate-900 shadow-emerald-100/80',
    headerStyle === 'split' && 'border-slate-200 bg-white text-slate-900 shadow-sm',
    headerStyle === 'modern' && 'border-slate-200 bg-white text-slate-900 shadow-sm'
  );

  const desktopNavShellClassName = cn(
    'hidden lg:flex items-center gap-1',
    isCapsuleHeader && 'rounded-full bg-slate-100 p-1.5',
    headerStyle === 'classic' && 'rounded-full bg-white/5 p-1',
    headerStyle === 'contrast' && 'rounded-full bg-white/5 p-1',
    headerStyle === 'bold' && 'rounded-full bg-white/10 p-1.5',
    headerStyle === 'mono' && 'rounded-full bg-white/5 p-1',
    headerStyle === 'luxe' && 'rounded-full bg-white/10 p-1.5',
    headerStyle === 'editorial' && 'rounded-full bg-white p-1.5 shadow-sm',
    headerStyle === 'storefront' && 'rounded-2xl bg-white/80 p-1 shadow-sm',
    headerStyle === 'glass' && 'rounded-full bg-white/40 p-1.5 shadow-sm',
    headerStyle === 'boxed' && 'rounded-2xl bg-slate-50 p-1 shadow-sm',
    headerStyle === 'underline' && 'border-b border-slate-200/80 pb-1'
  );

  const navLinkClasses = (active) => {
    const baseClassName = cn(
      'relative inline-flex items-center gap-1.5 font-medium transition-all duration-300',
      isCompactHeader ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
      isUnderlineHeader ? 'rounded-none border-b-2 border-transparent' : isCapsuleHeader ? 'rounded-full' : 'rounded-xl'
    );

    if (isUnderlineHeader) {
      return cn(
        baseClassName,
        isDarkHeader
          ? active
            ? 'text-white border-white'
            : 'text-slate-300 hover:text-white hover:border-white/40'
          : active
            ? 'text-slate-900 border-primary-500'
            : 'text-slate-600 hover:text-slate-950 hover:border-slate-300'
      );
    }

    return cn(
      baseClassName,
      isDarkHeader
        ? active
          ? 'bg-white/10 text-white'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
        : active
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
      headerStyle === 'editorial' && (active ? 'bg-stone-200 text-slate-950' : 'hover:bg-stone-200/70'),
      headerStyle === 'storefront' && (active ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-white'),
      headerStyle === 'minimal' && (active ? 'bg-slate-100 text-slate-950' : 'hover:bg-slate-100'),
      headerStyle === 'bold' && (active ? 'bg-white/15 text-white' : 'hover:bg-white/10'),
      headerStyle === 'luxe' && (active ? 'bg-amber-400/20 text-amber-50' : 'hover:bg-amber-500/10')
    );
  };

  const actionButtonClasses = cn(
    'relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-300',
    isDarkHeader ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950',
    isLuxeHeader && 'text-amber-200 hover:text-amber-50'
  );

  const searchInputClassName = cn(
    'w-full rounded-2xl border outline-none transition-all duration-300',
    isCompactHeader ? 'py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2 sm:pr-3 text-xs' : 'py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm',
    isDarkHeader
      ? searchFocused
        ? 'border-white/20 bg-slate-900 text-white ring-2 ring-white/15'
        : 'border-white/10 bg-white/5 text-white'
      : searchFocused
        ? 'border-primary-300 bg-white ring-2 ring-primary-200'
        : isLightBlurHeader
          ? 'border-white/40 bg-white/70 text-slate-900'
          : 'border-slate-200 bg-slate-50 text-slate-900'
  );

  const menuPanelClassName = cn(
    'border-t lg:hidden',
    isDarkHeader ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'
  );

  const headerPaddingClassName = cn(
    'container mx-auto px-3 sm:px-4 lg:px-8',
    isFloatingHeader && 'px-2 sm:px-3 lg:px-5'
  );

  const getLinkPathname = (path = '') => path.split('?')[0];
  const isActive = (path = '') => {
    if (!path || isExternalStoreLink(path)) return false;
    const pathname = getLinkPathname(path);
    if (!pathname) return false;
    return location.pathname === pathname || location.pathname.startsWith(`${pathname}/`);
  };

  const renderSearchForm = (className = '') => (
    <form onSubmit={handleSearch} className={cn('relative w-full', className)}>
      <Search
        className={cn(
          'absolute left-2.5 sm:left-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 transition-colors duration-300',
          searchFocused ? 'text-primary-500' : isDarkHeader ? 'text-slate-400' : 'text-slate-400'
        )}
      />
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        className={searchInputClassName}
      />
      {searchQuery && (
        <button
          type="submit"
          className={cn(
            'absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold transition-colors',
            isDarkHeader ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-primary-600 text-white hover:bg-primary-700'
          )}
        >
          Search
        </button>
      )}
    </form>
  );

  const renderDesktopCategoryChildren = (items = [], depth = 1) => (
    items.map((child) => {
      const hasChildren = (child.children || []).length > 0;
      return (
        <div key={child.id} className="space-y-1">
          <Link
            to={`/categories/${child.slug}`}
            className={cn(
              'block text-xs transition-colors',
              isDarkHeader ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            )}
            style={{ marginLeft: depth * 12 }}
          >
            {child.name}
          </Link>
          {hasChildren && (
            <div className="space-y-1">
              {renderDesktopCategoryChildren(child.children, depth + 1)}
            </div>
          )}
        </div>
      );
    })
  );

  const getCategoryExpandId = (id) => `category:${id}`;

  const renderMobileCategoryItems = (items = [], depth = 0) => (
    items.map((category) => {
      const hasChildren = (category.children || []).length > 0;
      const expandId = getCategoryExpandId(category.id);
      const isExpanded = expandedMobileNavIds.includes(expandId);
      const isCurrent = isActive(`/categories/${category.slug}`);

      return (
        <div key={category.id} className="space-y-1">
          <div className="flex items-center gap-2">
            <SmartStoreLink
              to={`/categories/${category.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex-1 rounded-xl px-2 sm:px-3 py-2 text-xs sm:text-sm transition-all',
                isDarkHeader
                  ? isCurrent
                    ? 'bg-white/10 text-white'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  : isCurrent
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              )}
              style={{ marginLeft: depth * 12 }}
            >
              {category.name}
            </SmartStoreLink>
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleMobileNav(expandId)}
                className={cn(
                  'rounded-xl p-2 transition-colors flex-shrink-0',
                  isDarkHeader ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                )}
              >
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-180')} />
              </button>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="space-y-1">
              {renderMobileCategoryItems(category.children, depth + 1)}
            </div>
          )}
        </div>
      );
    })
  );

  const renderDesktopNav = () => (
    <nav className={desktopNavShellClassName}>
      {navLinks.map((link) => {
        const childIsActive = link.type === 'categories'
          ? location.pathname.startsWith('/categories')
          : link.children.some((childLink) => isActive(childLink.to));
        const linkIsActive = link.type !== 'dropdown' && isActive(link.to);
        const active = childIsActive || linkIsActive;
        const customDropdownOpen = openDesktopDropdownId === link.id && link.type !== 'categories' && link.hasSubmenu;

        return (
          <div
            key={link.id}
            className="relative"
            onMouseEnter={link.hasSubmenu ? () => handleDesktopDropdownEnter(link.id) : undefined}
            onMouseLeave={link.hasSubmenu ? handleDesktopDropdownLeave : undefined}
          >
            {link.type === 'dropdown' ? (
              <button
                type="button"
                className={navLinkClasses(active)}
                onFocus={() => link.hasSubmenu && handleDesktopDropdownEnter(link.id)}
              >
                {link.label}
                {link.hasSubmenu && (
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openDesktopDropdownId === link.id && 'rotate-180')} />
                )}
                {link.badge && (
                  <span className="ml-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-rose-500/30">
                    {link.badge}
                  </span>
                )}
              </button>
            ) : (
              <SmartStoreLink
                to={link.to}
                newTab={link.newTab}
                className={navLinkClasses(active)}
                onFocus={() => link.hasSubmenu && handleDesktopDropdownEnter(link.id)}
              >
                {link.label}
                {link.hasSubmenu && (
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openDesktopDropdownId === link.id && 'rotate-180')} />
                )}
                {link.badge && (
                  <span className="ml-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-rose-500/30">
                    {link.badge}
                  </span>
                )}
              </SmartStoreLink>
            )}

            {customDropdownOpen && (
              <div
                className={cn(
                  'absolute left-0 top-full z-50 mt-2 hidden min-w-[240px] overflow-hidden rounded-2xl border py-2 shadow-2xl lg:block',
                  isDarkHeader ? 'border-white/10 bg-slate-900 shadow-slate-950/40' : 'border-slate-200 bg-white shadow-black/[0.08]'
                )}
              >
                {link.children.map((childLink) => (
                  <SmartStoreLink
                    key={childLink.id}
                    to={childLink.to}
                    newTab={childLink.newTab}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors',
                      isActive(childLink.to)
                        ? isDarkHeader
                          ? 'bg-white/10 text-white'
                          : 'bg-primary-50 text-primary-700'
                        : isDarkHeader
                          ? 'text-slate-200 hover:bg-white/5 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    )}
                  >
                    <span>{childLink.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                  </SmartStoreLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  const renderCta = (mobile = false) => {
    if (!navigation.ctaLabel) return null;

    return (
      <SmartStoreLink
        to={navigation.ctaLink || '/products'}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
          mobile ? 'w-full' : '',
          isDarkHeader ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-primary-600 text-white hover:bg-primary-700'
        )}
      >
        {navigation.ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </SmartStoreLink>
    );
  };

  const renderActions = () => (
    <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2">
      {navigation.showWishlist !== false && (
        <Link to="/wishlist" className={cn(actionButtonClasses, 'p-2 sm:p-2.5')}>
          <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          {wishlistItemsCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[16px] sm:h-[18px] min-w-[16px] sm:min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[9px] sm:text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
              {wishlistItemsCount}
            </span>
          )}
        </Link>
      )}

      {navigation.showCart !== false && (
        <button onClick={toggleCart} className={cn(actionButtonClasses, 'p-2 sm:p-2.5')}>
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          {cartItemsCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[16px] sm:h-[18px] min-w-[16px] sm:min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 px-1 text-[9px] sm:text-[10px] font-bold text-white shadow-lg shadow-primary-500/30">
              {cartItemsCount}
            </span>
          )}
        </button>
      )}

      {isAuthenticated ? (
        <div className="relative user-menu-container">
          <button
            onClick={() => setUserMenuOpen((open) => !open)}
            className={cn(
              'flex items-center gap-1 sm:gap-2 rounded-xl p-1.5 sm:pl-1.5 sm:pr-3 transition-all duration-300',
              isDarkHeader ? 'hover:bg-white/10' : 'hover:bg-slate-100'
            )}
          >
            <div className={cn(
              'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white',
              isDarkHeader ? 'bg-white/15' : 'bg-gradient-to-br from-primary-600 to-indigo-600'
            )}>
              <span className="text-xs sm:text-sm font-semibold">{user?.firstName?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <ChevronDown className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 transition-transform hidden sm:block', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <div
              className={cn(
                'absolute right-0 z-50 mt-2 w-60 rounded-2xl border py-2 shadow-2xl',
                isDarkHeader ? 'border-white/10 bg-slate-900 shadow-slate-950/40' : 'border-slate-100 bg-white shadow-black/[0.08]'
              )}
            >
              <div className={cn('border-b px-4 py-3', isDarkHeader ? 'border-white/10' : 'border-slate-100')}>
                <p className={cn('text-sm font-semibold', isDarkHeader ? 'text-white' : 'text-slate-900')}>{user?.firstName} {user?.lastName}</p>
                <p className={cn('mt-0.5 text-xs', isDarkHeader ? 'text-slate-400' : 'text-slate-500')}>{user?.email}</p>
              </div>

              <div className="py-1">
                {((['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) ? [
                    { to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
                    ...(user?.role === 'SUPER_ADMIN'
                      ? [{ to: '/super-admin/stores', icon: Store, label: 'Manage Stores' }]
                      : []),
                    { to: '/admin/orders', icon: Package, label: 'Manage Orders' },
                    { to: '/admin/products', icon: ShoppingBag, label: 'Manage Products' },
                    { to: '/profile', icon: User, label: 'My Profile' },
                  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                  { to: '/support', icon: MessageSquare, label: 'Support' },
                ] : [
                  { to: '/profile', icon: User, label: 'My Profile' },
                  { to: '/orders', icon: Package, label: 'My Orders' },
                  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                  { to: '/returns-history', icon: RefreshCw, label: 'Returns' },
                  { to: '/reviews', icon: StarIcon, label: 'My Reviews' },
                  { to: '/support', icon: MessageSquare, label: 'Support' },
                ]).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'group flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200',
                      isDarkHeader ? 'text-slate-200 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700'
                    )}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <item.icon className={cn('h-4 w-4', isDarkHeader ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-primary-500')} />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className={cn('border-t pt-1', isDarkHeader ? 'border-white/10' : 'border-slate-100')}>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-all duration-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : navigation.showAuthButtons !== false && (
        <div className="hidden sm:flex items-center gap-1 lg:gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="!rounded-xl !text-slate-600 hover:!text-slate-950 !px-2 lg:!px-3">
            Sign In
          </Button>
          {!navigation.ctaLabel && (
            <Button size="sm" onClick={() => navigate('/login')} className="!rounded-xl !bg-gradient-to-r !from-primary-600 !to-indigo-600 !text-white hover:!from-primary-700 hover:!to-indigo-700 !px-2 lg:!px-3">
              Get Started
            </Button>
          )}
        </div>
      )}

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={cn('rounded-xl p-2 sm:p-2.5 transition-all duration-300 lg:hidden', isDarkHeader ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950')}
      >
        {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>
    </div>
  );

  const desktopRowClassName = cn(
    'flex items-center gap-2 sm:gap-4',
    isCompactHeader ? 'min-h-[56px] py-2' : 'min-h-[64px] sm:min-h-[72px] py-2 sm:py-3'
  );

  const stackedRowClassName = cn(
    'hidden border-t lg:flex items-center gap-4',
    isCompactHeader ? 'py-2' : 'py-3',
    isDarkHeader ? 'border-white/10' : 'border-slate-200/80'
  );

  const renderDesktopLayout = () => {
    if (isStackedHeader) {
      return (
        <>
          <div className={cn(desktopRowClassName, 'justify-between')}>
            <StoreBrand store={store} storeName={storeName} isDarkHeader={isDarkHeader} headerStyle={headerStyle} />
            <div className="hidden max-w-md flex-1 lg:block">
              {navigation.showSearch !== false && renderSearchForm()}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              {renderCta()}
              {renderActions()}
            </div>
            <div className="lg:hidden">{renderActions()}</div>
          </div>
          <div className={stackedRowClassName}>
            <div className="flex flex-1 items-center justify-start">{renderDesktopNav()}</div>
            {navigation.showSearch !== false && (
              <div className="hidden max-w-sm flex-1 lg:flex">{renderSearchForm()}</div>
            )}
            <div className="hidden lg:block">{renderCta()}</div>
          </div>
        </>
      );
    }

    if (isCenteredHeader) {
      return (
        <>
          <div className={cn(desktopRowClassName, 'justify-between')}>
            <StoreBrand store={store} storeName={storeName} isDarkHeader={isDarkHeader} headerStyle={headerStyle} />
            <div className="hidden max-w-md flex-1 lg:block">
              {navigation.showSearch !== false && renderSearchForm()}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              {renderCta()}
              {renderActions()}
            </div>
            <div className="lg:hidden">{renderActions()}</div>
          </div>
          <div className={cn('hidden border-t lg:flex items-center justify-center', isCompactHeader ? 'py-2' : 'py-3', isDarkHeader ? 'border-white/10' : 'border-slate-200/80')}>
            {renderDesktopNav()}
          </div>
        </>
      );
    }

    if (isSplitHeader) {
      return (
        <div className={cn(desktopRowClassName, 'gap-4')}>
          <div className="hidden flex-1 items-center justify-start lg:flex">
            {renderDesktopNav()}
          </div>
          <StoreBrand store={store} storeName={storeName} isDarkHeader={isDarkHeader} headerStyle={headerStyle} />
          <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
            {navigation.showSearch !== false && <div className="max-w-sm flex-1">{renderSearchForm()}</div>}
            {renderCta()}
            {renderActions()}
          </div>
          <div className="ml-auto lg:hidden">{renderActions()}</div>
        </div>
      );
    }

    return (
      <div className={cn(desktopRowClassName, 'justify-between')}>
        <div className="flex items-center min-w-0 flex-shrink-0">
          <StoreBrand store={store} storeName={storeName} isDarkHeader={isDarkHeader} headerStyle={headerStyle} />
        </div>
        <div className="hidden lg:flex items-center flex-1 justify-center max-w-2xl mx-4">
          {renderDesktopNav()}
        </div>
        {navigation.showSearch !== false && (
          <div className="hidden md:flex max-w-xs lg:max-w-sm xl:max-w-md flex-1 mx-2">{renderSearchForm()}</div>
        )}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
          <div className="hidden lg:block">{renderCta()}</div>
          {renderActions()}
        </div>
      </div>
    );
  };

  return (
    <>
      <AnnouncementBannerRegion surfaces={['HEADER']} compact placement="header" />

      <header className={cn('sticky top-0 z-50 w-full', isFloatingHeader && 'px-3 pt-3 pb-3 lg:px-6 ')}>
        <div className={surfaceClassName}>
          <div className={headerPaddingClassName}>
            {renderDesktopLayout()}
          </div>

          {activeDesktopDropdown?.type === 'categories' && (
            <div
              className={cn(
                'absolute left-0 right-0 top-full hidden border-t lg:block',
                isDarkHeader ? 'border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/50' : 'border-slate-200 bg-white shadow-2xl shadow-black/[0.08]'
              )}
              onMouseEnter={() => handleDesktopDropdownEnter(activeDesktopDropdown.id)}
              onMouseLeave={handleDesktopDropdownLeave}
            >
              <div className="container mx-auto px-8 py-8">
                <div className="grid grid-cols-4 gap-8">
                  <div className="col-span-3">
                    <h3 className={cn('mb-4 text-xs font-semibold uppercase tracking-wider', isDarkHeader ? 'text-slate-500' : 'text-slate-400')}>
                      Shop by Category
                    </h3>
                    {categoryTree.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {categoryTree.map((category) => (
                          <div key={category.id} className={cn('rounded-xl p-3 transition-all duration-300', isDarkHeader ? 'hover:bg-white/5' : 'hover:bg-slate-50')}>
                            <Link
                              to={`/categories/${category.slug}`}
                              className="flex items-center gap-3"
                            >
                              <div className={cn('flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl', isDarkHeader ? 'bg-white/10' : 'bg-slate-100')}>
                                {category.image ? (
                                  <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Store className={cn('h-5 w-5', isDarkHeader ? 'text-slate-300' : 'text-slate-500')} />
                                )}
                              </div>
                              <div>
                                <p className={cn('text-sm font-medium', isDarkHeader ? 'text-white' : 'text-slate-900')}>{category.name}</p>
                                <p className={cn('text-xs', isDarkHeader ? 'text-slate-400' : 'text-slate-400')}>
                                  {category.description || 'Browse products'}
                                </p>
                              </div>
                            </Link>
                            {(category.children || []).length > 0 && (
                              <div className="mt-2 ml-12 space-y-1">
                                {renderDesktopCategoryChildren(category.children)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={cn('py-8 text-sm', isDarkHeader ? 'text-slate-400' : 'text-slate-500')}>No categories available</p>
                    )}
                  </div>

                  <AnnouncementBannerRegion surfaces={['CATEGORY_DROPDOWN']} compact placement="dropdown" className="w-full max-w-[320px] ml-auto" />
                </div>
              </div>
            </div>
          )}

          {mobileMenuOpen && (
            <div className={menuPanelClassName}>
              <div className="container mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 py-4 sm:py-6 max-w-full overflow-hidden">
                {navigation.showSearch !== false && (
                  <div className="w-full">
                    {renderSearchForm()}
                  </div>
                )}

                <nav className="space-y-2 w-full">
                  {navLinks.map((link) => {
                    const isCategoryLink = link.type === 'categories';
                    const submenuItems = isCategoryLink ? [] : link.children;
                    const isExpanded = expandedMobileNavIds.includes(link.id);
                    const childIsActive = isCategoryLink
                      ? location.pathname.startsWith('/categories')
                      : submenuItems.some((childLink) => isActive(childLink.to));
                    const linkIsActive = link.type !== 'dropdown' && isActive(link.to);

                    return (
                      <div
                        key={link.id}
                        className={cn(
                          'rounded-2xl border',
                          isDarkHeader ? 'border-white/10 bg-white/5' : 'border-slate-200/80 bg-white/60'
                        )}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2">
                          {link.type === 'dropdown' ? (
                            <button
                              type="button"
                              onClick={() => toggleMobileNav(link.id)}
                              className={cn(
                                'flex flex-1 items-center rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 text-left text-sm font-medium transition-all min-w-0',
                                isDarkHeader
                                  ? childIsActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                  : childIsActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                              )}
                            >
                              <span className="truncate">{link.label}</span>
                            </button>
                          ) : (
                            <SmartStoreLink
                              to={link.to}
                              newTab={link.newTab}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex flex-1 items-center rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 text-sm font-medium transition-all min-w-0',
                                isDarkHeader
                                  ? linkIsActive || childIsActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                  : linkIsActive || childIsActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                              )}
                            >
                              <span className="truncate">{link.label}</span>
                            </SmartStoreLink>
                          )}

                          {link.badge && (
                            <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white flex-shrink-0">
                              {link.badge}
                            </span>
                          )}

                          {link.hasSubmenu && (
                            <button
                              type="button"
                              onClick={() => toggleMobileNav(link.id)}
                              className={cn(
                                'rounded-xl p-2 sm:p-3 transition-colors flex-shrink-0',
                                isDarkHeader ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                              )}
                            >
                              <ChevronDown className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform', isExpanded && 'rotate-180')} />
                            </button>
                          )}
                        </div>

                        {link.hasSubmenu && isExpanded && (
                          <div className={cn('space-y-1.5 sm:space-y-2 px-2 sm:px-3 pb-2 sm:pb-3')}>
                            {isCategoryLink ? (
                              categoryTree.length > 0 ? (
                                <div className="space-y-1">
                                  {renderMobileCategoryItems(categoryTree)}
                                </div>
                              ) : (
                                <p className={cn('px-2 sm:px-3 py-2 text-xs sm:text-sm', isDarkHeader ? 'text-slate-400' : 'text-slate-500')}>
                                  No categories available.
                                </p>
                              )
                            ) : (
                              submenuItems.length > 0 ? submenuItems.map((childLink) => (
                                <SmartStoreLink
                                  key={childLink.id}
                                  to={childLink.to}
                                  newTab={childLink.newTab}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    'flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 text-sm transition-all min-w-0',
                                    isDarkHeader
                                      ? isActive(childLink.to)
                                        ? 'bg-white/10 text-white'
                                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                      : isActive(childLink.to)
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                                  )}
                                >
                                  {childLink.image ? (
                                    <img src={childLink.image} alt={childLink.label} className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-cover flex-shrink-0" />
                                  ) : (
                                    <div className={cn('flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg flex-shrink-0', isDarkHeader ? 'bg-white/10' : 'bg-slate-100')}>
                                      <Store className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDarkHeader ? 'text-slate-300' : 'text-slate-500')} />
                                    </div>
                                  )}
                                  <span className="min-w-0 truncate text-xs sm:text-sm">{childLink.label}</span>
                                </SmartStoreLink>
                              )) : (
                                <p className={cn('px-2 sm:px-3 py-2 text-xs sm:text-sm', isDarkHeader ? 'text-slate-400' : 'text-slate-500')}>
                                  No items configured yet.
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {renderCta(true)}

                {!isAuthenticated && navigation.showAuthButtons !== false && (
                  <div className="flex gap-2 border-t border-slate-200 pt-3 sm:pt-4">
                    <Button variant="outline" size="sm" className="flex-1 !text-xs sm:!text-sm" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                      Sign In
                    </Button>
                    {!navigation.ctaLabel && (
                      <Button size="sm" className="flex-1 !bg-gradient-to-r !from-primary-600 !to-indigo-600 !text-xs sm:!text-sm" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                        Get Started
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

const StoreBrand = ({ store, storeName, isDarkHeader, headerStyle }) => {
  const logoShellClassName = cn(
    'relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-300',
    headerStyle === 'classic' && 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-950/30',
    headerStyle === 'contrast' && 'bg-gradient-to-br from-amber-500 to-slate-950 shadow-amber-500/20',
    headerStyle === 'bold' && 'bg-gradient-to-br from-fuchsia-500 to-rose-600 shadow-fuchsia-500/30',
    headerStyle === 'mono' && 'bg-black text-white shadow-black/40',
    headerStyle === 'luxe' && 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-400/30',
    headerStyle === 'storefront' && 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-300/30',
    headerStyle === 'editorial' && 'bg-gradient-to-br from-stone-700 to-slate-900 shadow-stone-300/20',
    headerStyle === 'magazine' && 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-600/30',
    !isDarkHeader && !['storefront', 'editorial', 'bold', 'mono', 'luxe', 'magazine', 'contrast', 'classic'].includes(headerStyle)
      && 'bg-gradient-to-br from-primary-600 to-indigo-600 shadow-primary-500/25'
  );

  const brandTextClassName = cn(
    'text-lg sm:text-xl font-bold tracking-tight',
    isDarkHeader ? 'text-white' : 'text-slate-950',
    headerStyle === 'magazine' && 'sm:text-2xl uppercase tracking-[0.2em]',
    headerStyle === 'underline' && 'uppercase tracking-[0.18em]',
    headerStyle === 'mono' && 'font-semibold uppercase tracking-[0.16em]',
    headerStyle === 'compact' && 'text-base sm:text-lg'
  );

  return (
    <Link to="/" className="group flex shrink-0 items-center gap-1.5 sm:gap-2.5 min-w-0">
      {store.logoUrl ? (
        <img src={store.logoUrl} alt={storeName} className="h-8 w-8 sm:h-15 sm:w-15 rounded-xl object-cover shadow-lg flex-shrink-0" />
      ) : (
        <div className={logoShellClassName}>
          <Store className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      )}
      <span className={cn(brandTextClassName, 'truncate')} style={{ fontFamily: 'var(--font-display)' }}>
        {storeName}
      </span>
    </Link>
  );
};

export default Header;
