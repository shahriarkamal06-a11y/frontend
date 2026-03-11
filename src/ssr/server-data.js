import axios from 'axios';
import { normalizeCategory, normalizeProduct } from '../hooks/useApi';
import { normalizeContentPage } from '../utils/contentPages';
import { buildBlogExcerpt, normalizeBlogPost } from '../utils/blog';
import { normalizeStore, normalizeTheme } from '../utils/storeSettings';
import { getNormalizedProductGridConfig, getProductGridPageSize } from '../utils/themeHelpers';
import { normalizeHomepageSection } from '../utils/homepageSections';
import {
  extractLinkedProductIds,
  normalizePageRecord,
  sortProductsByIds,
} from '../utils/pageBuilder';

const DEFAULT_API_BASE_URL = 'https://backend-1-u836.onrender.com/api';

const API_TIMEOUT_MS = 10000;

const getApiBaseUrl = () =>
  DEFAULT_API_BASE_URL;

const normalizeDomain = (value = '') => {
  if (!value) return '';
  let hostname = String(value).trim().toLowerCase();
  if (!hostname) return '';
  hostname = hostname.split(',')[0].trim();
  hostname = hostname.replace(/^\[(.*)\]$/, '$1');
  hostname = hostname.replace(/:\d+$/, '');
  if (hostname.startsWith('www.')) hostname = hostname.slice(4);
  return hostname;
};

const createApiClient = ({ storeDomain } = {}) => axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    ...(storeDomain ? { 'x-store-domain': normalizeDomain(storeDomain) } : {}),
  },
});

const toArray = (value) => (Array.isArray(value) ? value : []);

const extractItems = (response) =>
  toArray(response?.data?.data?.items || response?.data?.items || response?.data?.data || response?.data);

const extractData = (response) => response?.data?.data || response?.data || null;

const normalizeSection = (section = {}) => normalizeHomepageSection(section);

const normalizeReviewSnippet = (review = {}) => ({
  id: review.id,
  rating: Number(review.rating) || 0,
  comment: review.comment || review.title || 'Customer review',
  user: review.userName || 'Customer',
  avatar: (review.userName || 'C').trim().charAt(0).toUpperCase(),
});

const normalizeProductReview = (review = {}) => ({
  id: review.id,
  user: review.userName || 'Customer',
  date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US') : '',
  rating: Number(review.rating) || 0,
  comment: review.comment || review.title || '',
  helpful: Number(review.helpfulCount) || 0,
  avatar: (review.userName || 'C').trim().charAt(0).toUpperCase(),
});

const stripText = (value = '') =>
  String(value)
    .replace(/[#[\]()*_`>!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseRequestPath = (requestPath) => {
  const url = new URL(requestPath, 'http://localhost');
  const pathname = url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : url.pathname;
  return {
    pathname,
    search: url.search,
  };
};

const STATIC_APP_ROUTES = new Set([
  '/help',
  '/shipping',
  '/returns',
  '/privacy',
  '/terms',
  '/cookies',
  '/thank-you',
  '/track',
  '/faq',
  '/size-guide',
  '/gift-cards',
  '/compare',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
  '/profile',
  '/orders',
  '/wishlist',
  '/returns-history',
  '/reviews',
  '/support',
  '/400',
  '/401',
  '/403',
  '/500',
  '/503',
]);

const APP_ROUTE_PATTERNS = [
  /^\/orders\/[^/]+$/,
  /^\/admin(?:\/.*)?$/,
];

const isKnownAppRoute = (pathname) => (
  STATIC_APP_ROUTES.has(pathname)
  || APP_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
);

const matchRoute = (pathname) => {
  if (pathname === '/') return { routeType: 'home' };
  if (pathname === '/products') return { routeType: 'products' };
  if (pathname === '/search') return { routeType: 'search' };
  if (pathname === '/blog') return { routeType: 'blog' };

  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    return {
      routeType: 'product',
      routeParams: { slug: decodeURIComponent(productMatch[1]) },
    };
  }

  const categoryMatch = pathname.match(/^\/categories\/([^/]+)$/);
  if (categoryMatch) {
    return {
      routeType: 'category',
      routeParams: { slug: decodeURIComponent(categoryMatch[1]) },
    };
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    return {
      routeType: 'blog-post',
      routeParams: { slug: decodeURIComponent(blogMatch[1]) },
    };
  }

  if (isKnownAppRoute(pathname)) {
    return { routeType: 'app' };
  }

  return { routeType: 'generic' };
};

async function fetchStoreSettings(api) {
  try {
    const response = await api.get('/stores/current/settings');
    const payload = extractData(response) || {};

    return {
      store: normalizeStore(payload.store || {}),
      theme: normalizeTheme(payload.theme || {}),
    };
  } catch {
    return {
      store: normalizeStore({}),
      theme: normalizeTheme({}),
    };
  }
}

async function fetchHomeData(api, theme) {
  const productLimit = String(Math.max(24, getProductGridPageSize(theme, 'grid')));
  const [productsResult, categoriesResult, sectionsResult, reviewsResult] = await Promise.allSettled([
    api.get('/products', { params: { limit: productLimit } }),
    api.get('/categories', { params: { limit: '500', page: '1' } }),
    api.get('/sections'),
    api.get('/reviews', { params: { limit: '3', page: '1' } }),
  ]);

  return {
    products: productsResult.status === 'fulfilled'
      ? extractItems(productsResult.value).map(normalizeProduct)
      : [],
    categories: categoriesResult.status === 'fulfilled'
      ? extractItems(categoriesResult.value).map(normalizeCategory)
      : [],
    sections: sectionsResult.status === 'fulfilled'
      ? extractItems(sectionsResult.value).map(normalizeSection)
      : [],
    testimonials: reviewsResult.status === 'fulfilled'
      ? extractItems(reviewsResult.value).map(normalizeReviewSnippet)
      : [],
  };
}

async function fetchCatalogData(api, productLimit = '48') {
  const [productsResult, categoriesResult] = await Promise.allSettled([
    api.get('/products', { params: { limit: productLimit } }),
    api.get('/categories', { params: { limit: '500', page: '1' } }),
  ]);

  return {
    products: productsResult.status === 'fulfilled'
      ? extractItems(productsResult.value).map(normalizeProduct)
      : [],
    categories: categoriesResult.status === 'fulfilled'
      ? extractItems(categoriesResult.value).map(normalizeCategory)
      : [],
  };
}

async function fetchProductData(api, slug, theme) {
  try {
    const productResponse = await api.get(`/products/slug/${encodeURIComponent(slug)}`);
    const product = normalizeProduct(extractData(productResponse));

    if (!product?.id) {
      return { product: null, relatedProducts: [], reviews: [] };
    }

    const productGrid = getNormalizedProductGridConfig(theme);
    const relatedLimit = Math.max(4, productGrid.desktopColumns);
    const [relatedResult, reviewsResult] = await Promise.allSettled([
      api.get(`/products/${product.id}/related`, { params: { limit: relatedLimit } }),
      api.get(`/reviews/product/${product.id}`, { params: { limit: 10 } }),
    ]);

    return {
      product,
      relatedProducts: relatedResult.status === 'fulfilled'
        ? extractItems(relatedResult.value).map(normalizeProduct)
        : [],
      reviews: reviewsResult.status === 'fulfilled'
        ? extractItems(reviewsResult.value).map(normalizeProductReview)
        : [],
    };
  } catch {
    return {
      product: null,
      relatedProducts: [],
      reviews: [],
    };
  }
}

async function fetchProductsByIds(api, ids = []) {
  if (!ids.length) {
    return [];
  }

  try {
    const response = await api.get('/products', {
      params: {
        ids: ids.join(','),
        active: 'true',
        limit: String(ids.length),
        page: '1',
      },
    });

    return sortProductsByIds(extractItems(response).map(normalizeProduct), ids);
  } catch {
    return [];
  }
}

async function fetchCustomPageData(api, pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  if (!slug) {
    return null;
  }

  try {
    const response = await api.get(`/pages/slug/${encodeURIComponent(slug)}`);
    const page = normalizePageRecord(extractData(response) || {});

    if (!page.id) {
      return null;
    }

    const linkedProductIds = extractLinkedProductIds(page.content);
    const linkedProducts = await fetchProductsByIds(api, linkedProductIds);

    return {
      page,
      linkedProducts,
    };
  } catch {
    return null;
  }
}

async function fetchContentPageData(api, pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  if (!slug) {
    return null;
  }

  try {
    const response = await api.get(`/content-pages/slug/${encodeURIComponent(slug)}`);
    const page = normalizeContentPage(extractData(response) || {});

    if (!page.id) {
      return null;
    }

    return { page };
  } catch {
    return null;
  }
}

async function fetchCategories(api) {
  try {
    const response = await api.get('/categories', { params: { limit: '500', page: '1' } });
    return extractItems(response).map(normalizeCategory);
  } catch {
    return [];
  }
}

async function fetchAnnouncements(api, { limit = '100' } = {}) {
  try {
    const response = await api.get('/announcements', {
      params: {
        limit: String(limit),
        sort: 'priority-desc',
      },
    });
    return extractItems(response);
  } catch {
    return [];
  }
}

async function fetchBlogListData(api) {
  try {
    const [postsResult, categoriesResult] = await Promise.allSettled([
      api.get('/blog', { params: { page: '1', limit: '50' } }),
      fetchCategories(api),
    ]);

    return {
      posts: postsResult.status === 'fulfilled'
        ? extractItems(postsResult.value).map((post) => normalizeBlogPost(post))
        : [],
      categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
    };
  } catch {
    return {
      posts: [],
      categories: [],
    };
  }
}

async function fetchBlogPostData(api, slug) {
  try {
    const response = await api.get(`/blog/${encodeURIComponent(slug)}`);
    const post = normalizeBlogPost(extractData(response) || {});

    if (!post?.id) {
      return {
        post: null,
        linkedProducts: [],
        recentPosts: [],
        categories: [],
      };
    }

    const [linkedProducts, recentPostsResult, categoriesResult] = await Promise.allSettled([
      fetchProductsByIds(api, post.linkedProductIds || []),
      api.get('/blog', { params: { page: '1', limit: '4' } }),
      fetchCategories(api),
    ]);

    const recentPosts = recentPostsResult.status === 'fulfilled'
      ? extractItems(recentPostsResult.value)
        .map((item) => normalizeBlogPost(item))
        .filter((item) => item.slug && item.slug !== post.slug)
        .slice(0, 3)
      : [];

    return {
      post,
      linkedProducts: linkedProducts.status === 'fulfilled' ? linkedProducts.value : [],
      recentPosts,
      categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
    };
  } catch {
    return {
      post: null,
      linkedProducts: [],
      recentPosts: [],
      categories: [],
    };
  }
}

export async function fetchInitialRouteData({ requestPath, query = {}, storeDomain } = {}) {
  const api = createApiClient({ storeDomain });
  const { pathname, search } = parseRequestPath(requestPath);
  const matchedRoute = matchRoute(pathname);
  let { routeType, routeParams = {} } = matchedRoute;
  const storeSettings = await fetchStoreSettings(api);
  const gridPageSize = String(getProductGridPageSize(storeSettings.theme, storeSettings.theme?.layoutType));

  let routeData = null;

  if (routeType === 'home') {
    routeData = await fetchHomeData(api, storeSettings.theme);
  } else if (routeType === 'products') {
    routeData = await fetchCatalogData(api, gridPageSize);
  } else if (routeType === 'search') {
    routeData = await fetchCatalogData(api, gridPageSize);
  } else if (routeType === 'blog') {
    routeData = await fetchBlogListData(api);
  } else if (routeType === 'blog-post') {
    routeData = await fetchBlogPostData(api, routeParams.slug);
    if (!routeData?.post?.id) {
      routeData = null;
      routeType = 'not-found';
    }
  } else if (routeType === 'category') {
    routeData = await fetchCatalogData(api, '200');
  } else if (routeType === 'product') {
    routeData = await fetchProductData(api, routeParams.slug, storeSettings.theme);
  } else if (routeType === 'generic') {
    routeData = await fetchContentPageData(api, pathname);
    if (routeData) {
      routeType = 'content-page';
    } else {
      routeData = await fetchCustomPageData(api, pathname);
      routeType = routeData ? 'custom-page' : 'not-found';
    }
  }

  const routeCategories = Array.isArray(routeData?.categories) ? routeData.categories : null;
  const [categories, announcements] = await Promise.all([
    routeCategories ? Promise.resolve(routeCategories) : fetchCategories(api),
    fetchAnnouncements(api),
  ]);

  return {
    pathname,
    search,
    routeType,
    routeParams,
    routeData,
    query,
    storeSettings,
    categories,
    announcements,
  };
}

export function buildSeoMeta(initialData) {
  const store = initialData?.storeSettings?.store || {};
  const routeType = initialData?.routeType;
  const routeData = initialData?.routeData || {};
  const storeName = store.name || 'Store';
  const defaultTitle = store.seo?.title || storeName;
  const defaultDescription = store.seo?.description || store.description || `Shop ${storeName} online.`;
  const defaultImage = store.seo?.ogImage || store.logoUrl || '';

  if (routeType === 'product' && routeData.product) {
    return {
      title: `${routeData.product.name} | ${storeName}`,
      description: stripText(routeData.product.shortDescription || routeData.product.description || defaultDescription).slice(0, 160) || defaultDescription,
      keywords: store.seo?.keywords || '',
      image: routeData.product.images?.[0] || defaultImage,
    };
  }

  if (routeType === 'category') {
    const category = toArray(routeData.categories).find((item) => item.slug === initialData?.routeParams?.slug);
    if (category) {
      return {
        title: `${category.name} | ${storeName}`,
        description: stripText(category.description || `Browse ${category.name} products at ${storeName}.`).slice(0, 160),
        keywords: store.seo?.keywords || '',
        image: category.image || defaultImage,
      };
    }
  }

  if (routeType === 'products') {
    return {
      title: `All Products | ${storeName}`,
      description: defaultDescription,
      keywords: store.seo?.keywords || '',
      image: defaultImage,
    };
  }

  if (routeType === 'search') {
    const queryText = stripText(initialData?.query?.q || '');
    return {
      title: queryText ? `Search: ${queryText} | ${storeName}` : `Search | ${storeName}`,
      description: defaultDescription,
      keywords: store.seo?.keywords || '',
      image: defaultImage,
    };
  }

  if (routeType === 'blog') {
    return {
      title: `Blog | ${storeName}`,
      description: defaultDescription,
      keywords: store.seo?.keywords || '',
      image: defaultImage,
    };
  }

  if (routeType === 'blog-post' && routeData?.post) {
    const post = routeData.post;
    const blogDescription = stripText(
      post.seo?.description
      || buildBlogExcerpt(post, 180)
      || post.excerpt
      || post.content
      || defaultDescription
    ).slice(0, 160);

    return {
      title: post.seo?.title || (post.title ? `${post.title} | ${storeName}` : defaultTitle),
      description: blogDescription || defaultDescription,
      keywords: post.seo?.keywords || store.seo?.keywords || '',
      image: post.coverImage || defaultImage,
    };
  }

  if (routeType === 'content-page' && routeData?.page) {
    const page = routeData.page;
    return {
      title: page.metaTitle || (page.title ? `${page.title} | ${storeName}` : defaultTitle),
      description: stripText(page.metaDescription || page.title || defaultDescription).slice(0, 160),
      keywords: store.seo?.keywords || '',
      image: defaultImage,
    };
  }

  if (routeType === 'custom-page' && routeData?.page) {
    const page = routeData.page;
    return {
      title: page.seo?.title || (page.title ? `${page.title} | ${storeName}` : defaultTitle),
      description: stripText(page.seo?.description || page.title || defaultDescription).slice(0, 160),
      keywords: page.seo?.keywords || store.seo?.keywords || '',
      image: defaultImage,
    };
  }

  if (routeType === 'not-found') {
    return {
      title: storeName ? `Page not found | ${storeName}` : 'Page not found',
      description: defaultDescription,
      keywords: store.seo?.keywords || '',
      image: defaultImage,
    };
  }

  return {
    title: defaultTitle,
    description: stripText(defaultDescription).slice(0, 160),
    keywords: store.seo?.keywords || '',
    image: defaultImage,
  };
}
