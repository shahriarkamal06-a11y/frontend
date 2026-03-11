/**
 * @module hooks/useApi
 * @description Custom hooks for fetching data from the backend API.
 */

import { useState, useEffect, useCallback } from 'react';
import { productAPI, categoryAPI, reviewAPI } from '../services/api';

const titleCase = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveVariantAttributes = (variant) => {
  if (!variant || typeof variant !== 'object') return {};
  const combination = variant.attributeCombination || variant.attribute_combination;
  if (combination && typeof combination === 'object' && Object.keys(combination).length > 0) {
    return combination;
  }
  const attributes = variant.attributes;
  if (attributes && typeof attributes === 'object') return attributes;
  return {};
};

const buildVariantOptions = (variants = []) => {
  const optionsMap = new Map();

  variants.forEach((variant) => {
    if (variant.isActive === false) return;

    const attributes = resolveVariantAttributes(variant);
    const attributeEntries = Object.entries(attributes).filter(([, value]) => String(value || '').trim());

    if (attributeEntries.length === 0) {
      const existing = optionsMap.get('variant') || {
        name: 'Variant',
        key: 'variant',
        options: [],
        values: new Set(),
      };
      if (!existing.values.has(variant.name)) {
        existing.values.add(variant.name);
        existing.options.push({
          label: variant.name,
          value: variant.name,
          variantId: variant.id,
        });
      }
      optionsMap.set('variant', existing);
      return;
    }

    attributeEntries.forEach(([key, rawValue]) => {
      const normalizedKey = String(key).toLowerCase();
      const value = String(rawValue).trim();
      const existing = optionsMap.get(normalizedKey) || {
        name: titleCase(key),
        key: normalizedKey,
        options: [],
        values: new Set(),
      };

      if (!existing.values.has(value)) {
        existing.values.add(value);
        existing.options.push({
          label: value,
          value,
        });
      }

      optionsMap.set(normalizedKey, existing);
    });
  });

  return Array.from(optionsMap.values()).map(({ values, ...optionGroup }) => optionGroup);
};

/**
 * Normalize a backend product to match the frontend data shape.
 * The backend uses snake_case DB columns; the frontend expects camelCase.
 */
export function normalizeProduct(p) {
  if (!p) return null;
  const price = parseFloat(p.price) || 0;
  const parsedComparePrice = parseFloat(p.compare_at_price || p.compareAtPrice);
  const parsedRating = parseFloat(p.avg_rating ?? p.avgRating ?? p.rating);
  const parsedReviewCount = parseInt(p.review_count ?? p.reviewCount, 10);
  const comparePrice = Number.isFinite(parsedComparePrice) && parsedComparePrice > price
    ? parsedComparePrice
    : null;
  const normalizedImages = Array.isArray(p.images)
    ? p.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : (p.product_images || []).map((img) => img.url).filter(Boolean);
  const normalizedVariants = (p.variants || []).map((v) => ({
    id: v.id,
    name: v.name,
    attributes: v.attributes || {},
    attributeCombination: v.attribute_combination || v.attributeCombination || {},
    sku: v.sku || '',
    price: parseFloat(v.price) || 0,
    compareAtPrice: parseFloat(v.compare_at_price || v.compareAtPrice) || null,
    quantity: parseInt(v.quantity, 10) || 0,
    imageUrl: v.image_url || v.imageUrl || '',
    weight: v.weight ?? null,
    isActive: v.is_active !== false && v.isActive !== false,
  }));
  const activeVariants = normalizedVariants.filter((variant) => variant.isActive);
  const normalizedBulkPricing = (p.bulkPricing || p.bulk_pricing || []).map((rule) => ({
    id: rule.id,
    minQty: parseInt(rule.min_qty || rule.minQty, 10) || 1,
    maxQty: rule.max_qty ?? rule.maxQty ?? null,
    price: parseFloat(rule.price) || 0,
    discountType: rule.discount_type || rule.discountType || 'FIXED',
    discountValue: rule.discount_value ?? rule.discountValue ?? null,
    title: rule.title || '',
    description: rule.description || '',
    isActive: rule.is_active !== false && rule.isActive !== false,
  })).filter((rule) => rule.isActive !== false);
  const derivedStock = activeVariants.length > 0
    ? activeVariants.reduce((sum, variant) => sum + (parseInt(variant.quantity, 10) || 0), 0)
    : parseInt(p.quantity || p.stock) || 0;
  const rawVariantAttributes = p.variant_attributes || p.variantAttributes || [];
  const normalizedVariantAttributes = Array.isArray(rawVariantAttributes)
    ? rawVariantAttributes.map((attr) => ({
        id: attr.id,
        name: attr.name,
        slug: attr.slug,
        displayType: attr.display_type || attr.displayType || 'select',
        sortOrder: attr.sort_order ?? attr.sortOrder ?? 0,
        isRequired: attr.is_required !== false && attr.isRequired !== false,
        values: Array.isArray(attr.values)
          ? attr.values.map((val) => ({
              id: val.id,
              value: val.value,
              displayName: val.display_name || val.displayName || val.value,
              colorCode: val.color_code || val.colorCode || null,
              imageUrl: val.image_url || val.imageUrl || null,
              sortOrder: val.sort_order ?? val.sortOrder ?? 0,
            }))
          : [],
      }))
    : [];
  const normalizedVariantOptions = normalizedVariantAttributes.length > 0
    ? normalizedVariantAttributes.map((attr) => ({
        name: attr.name,
        key: attr.slug,
        options: (attr.values || []).map((val) => ({
          label: val.displayName || val.value,
          value: val.value,
        })),
      }))
    : buildVariantOptions(activeVariants);
  const resolvedTrackQuantity = p.trackQuantity ?? p.custom_fields?.trackQuantity ?? p.customFields?.trackQuantity;
  const trackQuantity = resolvedTrackQuantity !== false;
  const continueSellingWhenOutOfStock = Boolean(
    p.continueSellingWhenOutOfStock
      ?? p.custom_fields?.continueSellingWhenOutOfStock
      ?? p.customFields?.continueSellingWhenOutOfStock
  );

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    shortDescription: p.short_description || p.shortDescription || '',
    price,
    comparePrice,
    sku: p.sku || '',
    category: p.category_name || p.categoryName || p.category || '',
    categorySlug: p.category_slug || p.categorySlug || '',
    section: p.section || p.section_slug || p.sectionSlug || '',
    sectionName: p.section_name || p.sectionName || '',
    sectionSlug: p.section_slug || p.sectionSlug || p.section || '',
    subcategory: p.subcategory || '',
    brand: p.brand || '',
    images: normalizedImages,
    rating: Number.isFinite(parsedRating) ? parsedRating : 0,
    reviewCount: Number.isFinite(parsedReviewCount) ? parsedReviewCount : 0,
    stock: derivedStock,
    trackQuantity,
    continueSellingWhenOutOfStock,
    features: p.features ?? p.custom_fields?.features ?? p.customFields?.features ?? [],
    variants: activeVariants,
    variantOptions: normalizedVariantOptions,
    variantAttributes: normalizedVariantAttributes,
    bulkPricing: normalizedBulkPricing,
    requiresVariantSelection: activeVariants.length > 0 || p.type === 'VARIABLE',
    isFlashSale: p.is_flash_sale || p.isFlashSale || false,
    flashSaleEnds: p.flash_sale_ends || p.flashSaleEnds || null,
    tags: p.tags || [],
    attributes: p.attributes || {},
    customFields: p.custom_fields || p.customFields || {},
    isActive: p.is_active !== false,
    type: p.type || 'SIMPLE',
    vendorId: p.vendor_id || p.vendorId || null,
    createdAt: p.created_at || p.createdAt || null,
  };
}

/**
 * Normalize a backend category to match the frontend data shape.
 */
export function normalizeCategory(c) {
  if (!c) return null;
  const rawSortOrder = c.sort_order ?? c.sortOrder;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    image: c.image_url || c.imageUrl || c.image || '',
    imageUrl: c.image_url || c.imageUrl || c.image || '',
    icon: c.icon || '',
    productCount: parseInt(c.product_count || c.productCount) || 0,
    parentId: c.parent_id || c.parentId || null,
    sortOrder: Number.isFinite(rawSortOrder)
      ? rawSortOrder
      : parseInt(rawSortOrder, 10) || 0,
    isActive: c.is_active !== undefined ? c.is_active : c.isActive !== false,
    children: (c.children || []).map(normalizeCategory),
  };
}

/**
 * Hook to fetch products from the API.
 */
export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('useProducts: Fetching products with params:', params);
    try {
      const response = await productAPI.getProducts(params);
      console.log('useProducts: Raw response:', response);
      const data = response.data.data;
      console.log('useProducts: Extracted data:', data);
      
      if (data && data.items) {
        console.log('useProducts: Found items:', data.items);
        setProducts(data.items.map(normalizeProduct));
        setPagination(data.pagination || null);
        setUsingFallback(false);
      } else if (Array.isArray(data)) {
        console.log('useProducts: Data is array:', data);
        setProducts(data.map(normalizeProduct));
        setUsingFallback(false);
      } else {
        console.log('useProducts: Unexpected format, using fallback');
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.warn('useProducts: API unavailable:', err.message);
      setProducts([]);
      setUsingFallback(false);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, pagination, usingFallback, refetch: fetchProducts };
}

/**
 * Hook to fetch a single product by slug.
 */
export function useProductBySlug(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productAPI.getProductBySlug(slug);
        // Use same pattern as working hooks
        const data = response.data.data || response.data;
        setProduct(normalizeProduct(data));
        setUsingFallback(false);
      } catch (err) {
        console.warn('API unavailable:', err.message);
        setProduct(null);
        setUsingFallback(false);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error, usingFallback };
}

/**
 * Hook to fetch featured products.
 */
export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getProducts({ section: 'featured', limit });
        const data = response.data.data;
        if (data && data.items) {
          setProducts(data.items.map(normalizeProduct));
        } else if (Array.isArray(data)) {
          setProducts(data.map(normalizeProduct));
        } else {
          throw new Error('Unexpected format');
        }
      } catch (err) {
        console.warn('Failed to load featured products:', err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { products, loading };
}

/**
 * Hook to fetch categories.
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryAPI.getCategories({ limit: 500, page: 1 });
        const data = response.data.data;
        if (data && data.items) {
          setCategories(data.items.map(normalizeCategory));
        } else if (Array.isArray(data)) {
          setCategories(data.map(normalizeCategory));
        } else {
          throw new Error('Unexpected format');
        }
        setUsingFallback(false);
      } catch (err) {
        console.warn('Failed to load categories from API:', err.message);
        setCategories([]);
        setUsingFallback(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, usingFallback };
}

/**
 * Hook to fetch product reviews.
 */
export function useProductReviews(productId, params = {}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await reviewAPI.getProductReviews(productId, params);
        const data = response.data.data;
        setReviews(data?.items || data?.reviews || data || []);
      } catch (err) {
        console.warn('Failed to load reviews:', err.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, JSON.stringify(params)]);

  return { reviews, loading };
}

/**
 * Hook to search products.
 */
export function useProductSearch(query, filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const search = useCallback(async () => {
    if (!query && Object.keys(filters).length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await productAPI.searchProducts(query, filters);
      const data = response.data.data;
      if (data && data.items) {
        setProducts(data.items.map(normalizeProduct));
        setPagination(data.pagination || null);
      } else if (Array.isArray(data)) {
        setProducts(data.map(normalizeProduct));
      } else {
        throw new Error('Unexpected format');
      }
    } catch (err) {
      console.warn('Failed to search products:', err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, JSON.stringify(filters)]);

  useEffect(() => {
    search();
  }, [search]);

  return { products, loading, pagination, refetch: search };
}

/**
 * Hook to fetch related products.
 */
export function useRelatedProducts(productId, limit = 4) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getRelatedProducts(productId, limit);
        const data = response.data.data;
        if (data && data.items) {
          setProducts(data.items.map(normalizeProduct));
        } else if (Array.isArray(data)) {
          setProducts(data.map(normalizeProduct));
        } else {
          throw new Error('Unexpected format');
        }
      } catch (err) {
        console.warn('Failed to load related products:', err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [productId, limit]);

  return { products, loading };
}
