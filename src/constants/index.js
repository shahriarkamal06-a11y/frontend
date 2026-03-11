const DEFAULT_API_PORT = process.env.NEXT_PUBLIC_API_PORT || '3001';
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const normalizeHostname = (hostname = '') => {
  if (!hostname) {
    return '';
  }

  return hostname.replace(/^\[(.*)\]$/, '$1').toLowerCase();
};

const isPrivateNetworkHost = (hostname = '') => (
  /^10(?:\.\d{1,3}){3}$/i.test(hostname)
  || /^192\.168(?:\.\d{1,3}){2}$/i.test(hostname)
  || /^172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/i.test(hostname)
);

const isLocalDevHost = (hostname = '') => {
  const normalized = normalizeHostname(hostname);

  return LOOPBACK_HOSTS.has(normalized)
    || isPrivateNetworkHost(normalized)
    || (!normalized.includes('.') && normalized !== '');
};

const formatHostname = (hostname = '') => (
  normalizeHostname(hostname) === '::1' ? '[::1]' : hostname
);

const buildApiBaseUrl = (protocol, hostname) => `${protocol}//${formatHostname(hostname)}:${DEFAULT_API_PORT}/api`;

const dedupeUrls = (urls) => [...new Set(urls.filter(Boolean))];

const getBrowserApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { protocol, hostname } = window.location;
  if (!hostname) {
    return null;
  }

  return buildApiBaseUrl(protocol, hostname);
};

const getBrowserApiFallbackUrls = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const { protocol, hostname } = window.location;
  const normalizedHost = normalizeHostname(hostname);
  const urls = [getBrowserApiBaseUrl()];

  if (!isLocalDevHost(normalizedHost)) {
    return dedupeUrls(urls);
  }

  const loopbackFallbacks = ['localhost', '127.0.0.1', '::1']
    .filter((candidate) => candidate !== normalizedHost)
    .map((candidate) => buildApiBaseUrl(protocol, candidate));

  return dedupeUrls([...urls, ...loopbackFallbacks]);
};

export const API_BASE_URL = 'https://backend-1-u836.onrender.com/api';

export const API_FALLBACK_BASE_URLS = [API_BASE_URL];

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

export const PRODUCT_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'created-desc', label: 'Newest First' }
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }
];

export const THEME_PRESETS = {
  modern: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8,
    buttonStyle: 'rounded',
    headerStyle: 'modern',
    footerLayout: 'detailed',
    layoutType: 'grid',
    productCardVariant: 'editorial',
    productCardSize: 'comfortable',
    productGridRows: 4,
    productGridColumnsMobile: 2,
    productGridColumnsTablet: 3,
    productGridColumnsDesktop: 3
  },
  classic: {
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    accentColor: '#dc2626',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    fontFamily: 'Georgia, serif',
    borderRadius: 4,
    buttonStyle: 'square',
    headerStyle: 'classic',
    footerLayout: 'simple',
    layoutType: 'list',
    productCardVariant: 'outline',
    productCardSize: 'comfortable',
    productGridRows: 4,
    productGridColumnsMobile: 1,
    productGridColumnsTablet: 2,
    productGridColumnsDesktop: 2
  },
  minimal: {
    primaryColor: '#000000',
    secondaryColor: '#6b7280',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    fontFamily: 'Helvetica, sans-serif',
    borderRadius: 0,
    buttonStyle: 'square',
    headerStyle: 'minimal',
    footerLayout: 'minimal',
    layoutType: 'grid',
    productCardVariant: 'minimal-card',
    productCardSize: 'compact',
    productGridRows: 4,
    productGridColumnsMobile: 2,
    productGridColumnsTablet: 3,
    productGridColumnsDesktop: 4
  }
};

export const PAGE_CONTENT_TYPES = [
  { type: 'hero', label: 'Hero Section', icon: 'Image' },
  { type: 'banner', label: 'Banner', icon: 'Layout' },
  { type: 'products', label: 'Product Grid', icon: 'Grid3x3' },
  { type: 'text', label: 'Text Block', icon: 'Type' },
  { type: 'image', label: 'Image', icon: 'Image' },
  { type: 'testimonials', label: 'Testimonials', icon: 'MessageSquare' },
  { type: 'features', label: 'Features', icon: 'Star' }
];

export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316'
];

export const PAGINATION_LIMITS = [10, 25, 50, 100];

export const IMAGE_UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 10
};

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s()-]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  }
};
