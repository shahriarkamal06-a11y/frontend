import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout, AdminLayout, SuperAdminLayout } from './components/layout';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/error/ErrorBoundary';

// Pages
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CategoryPage from './pages/public/CategoryPage';
import SearchPage from './pages/public/SearchPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import NotFoundPage from './pages/public/NotFoundPage';
import DynamicStorefrontPage from './pages/public/DynamicStorefrontPage';

// Error Pages
import { BadRequestPage, UnauthorizedPage, ForbiddenPage, ServerErrorPage, ServiceUnavailablePage } from './pages/error';
import HelpCenterPage from './pages/public/HelpCenterPage';
import ShippingPage from './pages/public/ShippingPage';
import ReturnsPage from './pages/public/ReturnsPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import CookiePolicyPage from './pages/public/CookiePolicyPage';
import OrderConfirmationPage from './pages/public/OrderConfirmationPage';
import OrderTrackingPage from './pages/public/OrderTrackingPage';
import OrderDetailsPage from './pages/customer/OrderDetailsPage';
import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';
import FAQPage from './pages/public/FAQPage';
import SizeGuidePage from './pages/public/SizeGuidePage';
import GiftCardsPage from './pages/public/GiftCardsPage';
import ComparePage from './pages/public/ComparePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute';

// Customer Pages
import ProfilePage from './pages/customer/ProfilePage';
import OrdersPage from './pages/customer/OrdersPage';
import WishlistPage from './pages/customer/WishlistPage';
import ReturnsHistoryPage from './pages/customer/ReturnsHistoryPage';
import ReviewsManagementPage from './pages/customer/ReviewsManagementPage';
import SupportTicketsPage from './pages/customer/SupportTicketsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductManagement from './pages/admin/AdminProductManagement';
import AdminProductEditor from './pages/admin/AdminProductEditor';
import AdminSectionManagement from './pages/admin/AdminSectionManagement';
import { AdminOrders, AdminCustomers } from './pages/admin';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReviews from './pages/admin/AdminReviews';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSystemLogsPage from './pages/admin/AdminSystemLogsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminBlogManagement from './pages/admin/AdminBlogManagement';
import AdminContentPages from './pages/admin/AdminContentPages';
import AdminStoreManagement from './pages/admin/AdminStoreManagement';
import { useStoreSettingsStore } from './store';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App({ initialData = null, location = '/' }) {
  const [queryClient] = useState(createQueryClient);
  const didBootstrapStore = useRef(false);
  const isServer = typeof window === 'undefined';
  const RouterComponent = isServer ? MemoryRouter : BrowserRouter;

  if (initialData?.storeSettings && !didBootstrapStore.current) {
    useStoreSettingsStore.getState().setSettings(initialData.storeSettings);
    didBootstrapStore.current = true;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterComponent
          {...(isServer
            ? { initialEntries: [location] }
            : { future: { v7_relativeSplatPath: true } })}
        >
          <ScrollToTop />
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="categories/:slug" element={<CategoryPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="about" element={<DynamicStorefrontPage />} />
                <Route path="contact" element={<DynamicStorefrontPage />} />
                <Route path="help" element={<HelpCenterPage />} />
                <Route path="shipping" element={<ShippingPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="privacy" element={<PrivacyPolicyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="cookies" element={<CookiePolicyPage />} />
                <Route path="thank-you" element={<OrderConfirmationPage />} />
                <Route path="track" element={<OrderTrackingPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogPostPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="size-guide" element={<SizeGuidePage />} />
                <Route path="gift-cards" element={<GiftCardsPage />} />
                <Route path="compare" element={<ComparePage />} />

                {/* Customer Routes */}
                <Route path="profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="orders/:orderId" element={
                  <ProtectedRoute>
                    <OrderDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="wishlist" element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                } />
                <Route path="returns-history" element={
                  <ProtectedRoute>
                    <ReturnsHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="reviews" element={
                  <ProtectedRoute>
                    <ReviewsManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="support" element={
                  <ProtectedRoute>
                    <SupportTicketsPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<DynamicStorefrontPage />} />
              </Route>

              {/* Auth Routes (without layout) */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="verify-email" element={<EmailVerificationPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />

              {/* Error Routes (without layout) */}
              <Route path="400" element={<BadRequestPage />} />
              <Route path="401" element={<UnauthorizedPage />} />
              <Route path="403" element={<ForbiddenPage />} />
              <Route path="500" element={<ServerErrorPage />} />
              <Route path="503" element={<ServiceUnavailablePage />} />

              {/* Admin Routes with Sidebar Layout */}
              <Route path="admin" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="stores" element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <AdminStoreManagement />
                  </ProtectedRoute>
                } />
                <Route path="products" element={<AdminProductManagement />} />
                <Route path="products/new" element={<AdminProductEditor />} />
                <Route path="products/:id/edit" element={<AdminProductEditor />} />
                <Route path="sections" element={<AdminSectionManagement />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="store-settings" element={<AdminStoreSettings />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="logs" element={<AdminSystemLogsPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="blog" element={<AdminBlogManagement />} />
                <Route path="content" element={<AdminContentPages />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Super Admin Routes */}
              <Route path="super-admin" element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <SuperAdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="stores" replace />} />
                <Route path="stores" element={<AdminStoreManagement />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </RouterComponent>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
