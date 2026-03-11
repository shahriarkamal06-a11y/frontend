import axios from 'axios';
import { API_BASE_URL, API_FALLBACK_BASE_URLS } from '../constants';
import { storage } from '../utils';
import { normalizeHomepageSection } from '../utils/homepageSections';

const normalizeSectionRecord = (section = {}) => normalizeHomepageSection(section);

const normalizeSectionResponse = (response) => {
  const payload = response?.data?.data;

  if (Array.isArray(payload?.items)) {
    response.data.data = {
      ...payload,
      items: payload.items.map(normalizeSectionRecord),
    };
    return response;
  }

  if (payload && typeof payload === 'object') {
    response.data.data = normalizeSectionRecord(payload);
  }

  return response;
};

const RETRIABLE_READ_METHODS = new Set(['get', 'head', 'options']);

const isNetworkTimeoutError = (error) => (
  !error?.response
  && (
    error?.code === 'ECONNABORTED'
    || error?.code === 'ETIMEDOUT'
    || error?.code === 'ERR_NETWORK'
    || /timeout|network error/i.test(error?.message || '')
  )
);

const getNextFallbackBaseUrl = (config = {}) => {
  const triedBaseUrls = new Set([
    API_BASE_URL,
    ...(config.__triedBaseUrls || []),
    config.baseURL,
  ].filter(Boolean));

  return API_FALLBACK_BASE_URLS.find((baseUrl) => !triedBaseUrls.has(baseUrl)) || null;
};

const promoteResolvedBaseUrl = (baseURL) => {
  if (baseURL && baseURL !== api.defaults.baseURL) {
    api.defaults.baseURL = baseURL;
  }
};

const getStoreDomainHeader = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.location.hostname || null;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    config.baseURL = config.baseURL || api.defaults.baseURL;

    // Add session ID for guest cart support
    let sessionId = storage.get('sessionId');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      storage.set('sessionId', sessionId);
    }
    config.headers['x-session-id'] = sessionId;

    const storeDomain = getStoreDomainHeader();
    if (storeDomain) {
      config.headers['x-store-domain'] = storeDomain;
    }

    // Add auth token
    const token = storage.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    promoteResolvedBaseUrl(response?.config?.baseURL);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest
      && RETRIABLE_READ_METHODS.has((originalRequest.method || 'get').toLowerCase())
      && isNetworkTimeoutError(error)
    ) {
      const fallbackBaseUrl = getNextFallbackBaseUrl(originalRequest);

      if (fallbackBaseUrl) {
        return api({
          ...originalRequest,
          baseURL: fallbackBaseUrl,
          __triedBaseUrls: [...(originalRequest.__triedBaseUrls || []), fallbackBaseUrl],
        });
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.get('refreshToken');
        if (refreshToken) {
          const refreshBaseUrl = api.defaults.baseURL || API_BASE_URL;
          const response = await axios.post(`${refreshBaseUrl}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          storage.set('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        storage.remove('accessToken');
        storage.remove('refreshToken');
        storage.remove('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  createAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  changePassword: (data) => api.put('/users/change-password', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Store API — Single store mode
export const storeAPI = {
  // Super admin: list all stores
  listStores: (params) => api.get('/stores', { params }),
  // Super admin: create a new store
  createStore: (data) => api.post('/stores', data),
  // Super admin: delete a store
  deleteStore: (id) => api.delete(`/stores/${id}`),
  // Get the current store (auto-resolved by backend)
  getCurrentStore: () => api.get('/stores/current'),
  // Get all admin settings (store + theme)
  getCurrentSettings: () => api.get('/stores/current/settings'),
  // Update the current store
  updateCurrentStore: (data) => api.put('/stores/current', data),
  // Update all admin settings (store + theme)
  updateCurrentSettings: (settings) => api.put('/stores/current/settings', settings),
  // Get store by ID (fallback)
  getStoreById: (id) => api.get(`/stores/${id}`),
  getStoreBySlug: (slug) => api.get(`/stores/slug/${slug}`),
  updateStore: (id, data) => api.put(`/stores/${id}`, data),
  getStoreTheme: (storeId) => api.get(`/stores/${storeId}/theme`),
  updateStoreTheme: (storeId, theme) => api.put(`/stores/${storeId}/theme`, theme),
  getStoreSettings: (storeId) => api.get(`/stores/${storeId}/settings`),
  updateStoreSettings: (storeId, settings) => api.put(`/stores/${storeId}/settings`, settings),
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkImportProducts: (products) => api.post('/products/bulk/import', { products }),
  bulkUpdateProducts: (productIds, updates) => api.put('/products/bulk/update', { productIds, updates }),
  bulkDeleteProducts: (productIds) => api.delete('/products/bulk/delete', { data: { productIds } }),
  uploadProductImages: (productId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteProductImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  searchProducts: (query, filters = {}) => api.get('/products', {
    params: {
      ...filters,
      search: query || filters.search,
    },
  }),
  getFeaturedProducts: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getRelatedProducts: (productId, limit = 4) => api.get(`/products/${productId}/related`, { params: { limit } }),
};

// Category API
export const categoryAPI = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  getCategoryBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getCategoryTree: () => api.get('/categories/tree'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/items', data),
  updateCartItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

// Order API
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  refundOrder: (id, data) => api.post(`/orders/${id}/refund`, data),
  getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/intent', data),
  confirmPayment: (intentId, data) => api.post(`/payments/${intentId}/confirm`, data),
  getPaymentMethods: () => api.get('/payments/methods'),
  savePaymentMethod: (data) => api.post('/payments/methods', data),
  deletePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
};

// Review API
export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  getMyReviews: (params) => api.get('/reviews/me', { params }),
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  approveReview: (id) => api.put(`/reviews/${id}/approve`),
  rejectReview: (id) => api.put(`/reviews/${id}/reject`),
  replyToReview: (id, adminReply) => api.put(`/reviews/${id}/reply`, { adminReply }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId, variantId) => api.post('/wishlist/items', { productId, variantId }),
  removeFromWishlist: (itemId) => api.delete(`/wishlist/items/${itemId}`),
  clearWishlist: () => api.delete('/wishlist'),
};

// Coupon API
export const couponAPI = {
  getCoupons: (params) => api.get('/coupons', { params }),
  getCouponById: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (code) => api.post('/coupons/validate', { code }),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: (storeId = 'current', period = '30d') => api.get(`/analytics/dashboard/${storeId}`, { params: { period } }),
  getRevenueChart: (storeId = 'current', period = '30d') => api.get(`/analytics/revenue/${storeId}`, { params: { period } }),
  getOrdersChart: (storeId = 'current', period = '30d') => api.get(`/analytics/orders/${storeId}`, { params: { period } }),
  getTopProducts: (storeId = 'current', limit = 10, period = '30d') => api.get(`/analytics/top-products/${storeId}`, { params: { limit, period } }),
  getCustomerGrowth: (storeId = 'current', period = '30d') => api.get(`/analytics/customers/${storeId}`, { params: { period } }),
  getConversionRate: (storeId = 'current', period = '30d') => api.get(`/analytics/conversion/${storeId}`, { params: { period } }),
};

// Page API
export const pageAPI = {
  getPages: (params) => api.get('/pages', { params }),
  getPageById: (id) => api.get(`/pages/${id}`),
  getPageBySlug: (slug) => api.get(`/pages/slug/${slug}`),
  createPage: (data) => api.post('/pages', data),
  updatePage: (id, data) => api.put(`/pages/${id}`, data),
  deletePage: (id) => api.delete(`/pages/${id}`),
};

export const contentPageAPI = {
  getPages: (params) => api.get('/content-pages', { params }),
  getPageById: (id) => api.get(`/content-pages/${id}`),
  getPageBySlug: (slug) => api.get(`/content-pages/slug/${slug}`),
  createPage: (data) => api.post('/content-pages', data),
  updatePage: (id, data) => api.put(`/content-pages/${id}`, data),
  deletePage: (id) => api.delete(`/content-pages/${id}`),
};

// Blog API
export const blogAPI = {
  getPosts: (params) => api.get('/blog', { params }),
  getPostBySlug: (slug) => api.get(`/blog/${slug}`),
  createPost: (data) => api.post('/blog', data),
  updatePost: (id, data) => api.put(`/blog/${id}`, data),
  deletePost: (id) => api.delete(`/blog/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleImages: (files, folder = 'general') => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('folder', folder);
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (url) => api.delete('/upload/image', { data: { url } }),
};

// Chat API
export const chatAPI = {
  getSessions: (params) => api.get('/chat/sessions', { params }),
  getSession: (sessionId) => api.get(`/chat/sessions/${sessionId}`),
  getMessages: (sessionId, params) => api.get(`/chat/sessions/${sessionId}/messages`, { params }),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),
  getChatStats: () => api.get('/chat/stats'),
};

// Section API
export const sectionAPI = {
  getSections: (params) => api.get('/sections', { params }).then(normalizeSectionResponse),
  getSection: (id) => api.get(`/sections/${id}`).then(normalizeSectionResponse),
  createSection: (data) => api.post('/sections', data).then(normalizeSectionResponse),
  updateSection: (id, data) => api.put(`/sections/${id}`, data).then(normalizeSectionResponse),
  deleteSection: (id) => api.delete(`/sections/${id}`)
};

// Announcement API
export const announcementAPI = {
  getAnnouncements: (params) => api.get('/announcements', { params }),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

// System Logs API
export const systemLogAPI = {
  getLogs: (params) => api.get('/system-logs', { params }),
};

export default api;
