import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import CartDrawer from '../cart/CartDrawer';
import { AnnouncementBannerRegion, AnnouncementManager } from '../announcement';
import { useAuthStore, useCartStore, useStoreSettingsStore, useWishlistStore } from '../../store';
import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { applyTheme, getThemeCssVars } from '../../utils';

const ChatWidget = lazy(() => import('../chat/ChatWidget'));

const Layout = () => {
  const { store, theme, loadSettings } = useStoreSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const loadCart = useCartStore((state) => state.loadCart);
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);
  const [showDeferredUi, setShowDeferredUi] = useState(false);
  const themeVars = useMemo(() => getThemeCssVars(theme), [theme]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.title = store.seo?.title || store.name || 'Store';

    if (!store.faviconUrl) {
      return;
    }

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }

    favicon.setAttribute('href', store.faviconUrl);
  }, [store.faviconUrl, store.name, store.seo?.title]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
      return;
    }

    useWishlistStore.setState({ items: [] });
  }, [isAuthenticated, loadWishlist]);

  useEffect(() => {
    if (showDeferredUi) return undefined;

    const activateDeferredUi = () => setShowDeferredUi(true);
    const idleId = window.setTimeout(activateDeferredUi, 1200);

    window.addEventListener('pointerdown', activateDeferredUi, { once: true, passive: true });
    window.addEventListener('keydown', activateDeferredUi, { once: true });

    return () => {
      window.clearTimeout(idleId);
      window.removeEventListener('pointerdown', activateDeferredUi);
      window.removeEventListener('keydown', activateDeferredUi);
    };
  }, [showDeferredUi]);

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-200"
      data-storefront-theme
      data-button-style={theme?.buttonStyle || 'rounded'}
      data-header-style={theme?.headerStyle || 'modern'}
      data-footer-layout={theme?.footerLayout || 'detailed'}
      data-layout-type={theme?.layoutType || 'grid'}
      data-product-card-variant={theme?.productCardVariant || 'editorial'}
      style={themeVars}
    >
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      {showDeferredUi && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
      {showDeferredUi && <AnnouncementManager />}
    </div>
  );
};

export default Layout;
