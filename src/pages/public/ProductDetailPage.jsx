import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingCart, Heart, Minus, Plus,
  Share2, ChevronRight, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatCurrency } from '../../utils';
import ProductLightbox from '../../components/ui/ProductLightbox';
import ProductsCardAll from '../../components/products/ProductsCardAll';
import { productAPI, reviewAPI } from '../../services/api';
import { normalizeProduct } from '../../hooks/useApi';
import { getIconComponent } from '../../utils/iconUtils';
import { useAuthStore, useCartStore, useStoreSettingsStore, useWishlistStore } from '../../store';
import { useInitialData } from '../../ssr/initial-data';

const ImageWithFallback = ({ src, alt, className, loading = 'lazy', ...props }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showFallback = !src || error;

  useEffect(() => {
    setError(false);
    setLoaded(false);
    if (!src) return;

    let isActive = true;
    const preload = new Image();
    preload.onload = () => {
      if (!isActive) return;
      setLoaded(true);
      setError(false);
    };
    preload.onerror = () => {
      if (!isActive) return;
      setError(true);
    };
    preload.src = src;

    return () => {
      isActive = false;
    };
  }, [src]);

  return (
    <div className={`relative ${className}`} {...props}>
      {!loaded && !showFallback && (
        <div className="absolute inset-0 shimmer rounded-inherit" />
      )}
      {showFallback ? (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <Package className="h-16 w-16 text-slate-300" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
          loading={loading}
        />
      )}
    </div>
  );
};

const markdownComponents = {
  h1: ({ ...props }) => <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-3" {...props} />,
  h2: ({ ...props }) => <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3" {...props} />,
  h3: ({ ...props }) => <h3 className="text-lg font-semibold text-slate-900 mt-5 mb-2" {...props} />,
  h4: ({ ...props }) => <h4 className="text-base font-semibold text-slate-900 mt-4 mb-2" {...props} />,
  p: ({ ...props }) => <p className="text-slate-700 leading-7 mb-3" {...props} />,
  ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-700" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-700" {...props} />,
  li: ({ ...props }) => <li className="leading-7" {...props} />,
  blockquote: ({ ...props }) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...props} />,
  a: ({ ...props }) => <a className="text-violet-600 hover:text-violet-700 underline" {...props} />,
  code: ({ inline, className, children, ...props }) =>
    inline ? (
      <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-800 text-sm" {...props}>
        {children}
      </code>
    ) : (
      <code className={`block p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto text-sm ${className || ''}`} {...props}>
        {children}
      </code>
    ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto my-5">
      <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden text-sm" {...props} />
    </div>
  ),
  thead: ({ ...props }) => <thead className="bg-slate-100" {...props} />,
  th: ({ ...props }) => <th className="px-4 py-3 text-left font-semibold text-slate-800 border-b border-slate-200" {...props} />,
  td: ({ ...props }) => <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-top" {...props} />,
  hr: ({ ...props }) => <hr className="my-6 border-slate-200" {...props} />,
};

const normalizeReviewForDisplay = (review = {}) => ({
  id: review.id,
  user: review.userName || 'Customer',
  date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '',
  rating: Number(review.rating) || 0,
  comment: review.comment || review.title || '',
  helpful: Number(review.helpfulCount) || 0,
  avatar: (review.userName || 'C').trim().charAt(0).toUpperCase(),
});

const DEFAULT_BENEFIT_ICON_SEQUENCE = ['Truck', 'Shield', 'RotateCcw'];

const BENEFIT_KEYS = [
  'benefits',
  'highlights',
  'trustBadges',
  'serviceHighlights',
  'purchaseHighlights',
  'shoppingBenefits',
];

const normalizeBenefitItem = (item, index) => {
  const fallbackIcon = DEFAULT_BENEFIT_ICON_SEQUENCE[index % DEFAULT_BENEFIT_ICON_SEQUENCE.length];

  if (typeof item === 'string') {
    const label = item.trim();
    return label ? { label, icon: fallbackIcon } : null;
  }

  if (!item || typeof item !== 'object') return null;

  const labelCandidate = [item.label, item.title, item.text, item.name, item.value]
    .find((value) => typeof value === 'string' && value.trim());

  if (!labelCandidate) return null;

  const iconCandidate = [item.icon, item.iconName, item.lucideIcon]
    .find((value) => typeof value === 'string' && value.trim());

  return {
    label: labelCandidate.trim(),
    icon: iconCandidate || fallbackIcon,
  };
};

const buildBenefitFromObject = (source) => {
  if (!source || typeof source !== 'object') return [];

  const candidateKeys = [
    'freeShipping',
    'shipping',
    'shippingInfo',
    'warranty',
    'warrantyInfo',
    'warrantyPeriod',
    'returns',
    'returnPolicy',
    'returnWindow',
  ];

  return candidateKeys
    .filter((key) => typeof source[key] === 'string' && source[key].trim())
    .map((key, index) => ({
      label: source[key].trim(),
      icon: DEFAULT_BENEFIT_ICON_SEQUENCE[index % DEFAULT_BENEFIT_ICON_SEQUENCE.length] || key,
    }));
};

const getProductBenefits = (product) => {
  if (!product) return [];

  const benefitSources = [product.customFields, product.attributes];

  for (const source of benefitSources) {
    if (!source || typeof source !== 'object') continue;

    for (const key of BENEFIT_KEYS) {
      if (!Array.isArray(source[key]) || source[key].length === 0) continue;

      const normalized = source[key]
        .map((item, index) => normalizeBenefitItem(item, index))
        .filter(Boolean)
        .slice(0, 3);

      if (normalized.length > 0) return normalized;
    }

    const objectBenefits = buildBenefitFromObject(source).slice(0, 3);
    if (objectBenefits.length > 0) return objectBenefits;
  }

  if (Array.isArray(product.features) && product.features.length > 0) {
    const normalizedFeatures = product.features
      .map((item, index) => normalizeBenefitItem(item, index))
      .filter(Boolean)
      .slice(0, 3);

    if (normalizedFeatures.length > 0) return normalizedFeatures;
  }

  return [];
};

const normalizeSelectionValue = (value) => String(value || '').trim().toLowerCase();

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'product' && initialData?.routeParams?.slug === slug
    ? initialData.routeData
    : null;
  const [product, setProduct] = useState(() => initialRouteData?.product || null);
  const [relatedProducts, setRelatedProducts] = useState(() => initialRouteData?.relatedProducts || []);
  const [reviews, setReviews] = useState(() => initialRouteData?.reviews || []);
  const [isLoading, setIsLoading] = useState(() => !initialRouteData);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeTab, setActiveTab] = useState('description');
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const theme = useStoreSettingsStore((state) => state.theme);
  const relatedProductsLimit = Math.max(4, theme?.productGridColumnsDesktop || 4);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);

  const loadProductReviews = async (productId) => {
    if (!productId) {
      setReviews([]);
      return [];
    }

    try {
      const reviewsResponse = await reviewAPI.getProductReviews(productId, { limit: 10 });
      const reviewItems = reviewsResponse.data?.data?.items || reviewsResponse.data?.items || [];
      const normalizedReviews = reviewItems.map(normalizeReviewForDisplay);
      setReviews(normalizedReviews);
      return normalizedReviews;
    } catch {
      setReviews([]);
      return [];
    }
  };

  const refreshProductSummary = async (productSlug = slug) => {
    const productResponse = await productAPI.getProductBySlug(productSlug);
    const productData = productResponse.data.data || productResponse.data;
    const normalizedProduct = normalizeProduct(productData);
    setProduct(normalizedProduct);
    return normalizedProduct;
  };

  useEffect(() => {
    if (initialRouteData) {
      if (initialRouteData.product?.id) {
        loadProductReviews(initialRouteData.product.id);
      }

      if (isAuthenticated && initialRouteData.product?.id) {
        loadMyReview(initialRouteData.product.id);
      } else {
        setMyReview(null);
      }
      return;
    }

    loadData();
  }, [slug, isAuthenticated, initialRouteData, relatedProductsLimit]);

  const loadMyReview = async (productId) => {
    try {
      const myReviewResponse = await reviewAPI.getMyReviews({
        productId,
        limit: '1',
      });
      const myReviewItem = myReviewResponse?.data?.data?.items?.[0] || null;
      setMyReview(myReviewItem);
    } catch {
      setMyReview(null);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load product - same logic as AdminProductManagement
      const productResponse = await productAPI.getProductBySlug(slug);
      const productData = productResponse.data.data || productResponse.data;
      const normalizedProduct = normalizeProduct(productData);
      setProduct(normalizedProduct);

      // Load related products if we have a product
      if (normalizedProduct?.id) {
        try {
          const relatedResponse = await productAPI.getRelatedProducts(normalizedProduct.id, relatedProductsLimit);
          const relatedItems = relatedResponse.data?.data?.items || relatedResponse.data?.items || [];
          setRelatedProducts(relatedItems.map(normalizeProduct));
        } catch {
          setRelatedProducts([]);
        }

        await loadProductReviews(normalizedProduct.id);

        if (isAuthenticated) {
          await loadMyReview(normalizedProduct.id);
        } else {
          setMyReview(null);
        }
      }
    } catch (error) {
      console.warn('Failed to load product from API:', error);
      setProduct(null);
      setRelatedProducts([]);
      setReviews([]);
      setMyReview(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when product changes
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);

    // Initialize variant selection with first available option for each attribute
    const initialSelection = {};
    if (product?.variantAttributes?.length > 0) {
      product.variantAttributes.forEach(attr => {
        if (attr.values && attr.values.length > 0) {
          // Auto-select first value if only one option, otherwise leave unselected
          if (attr.values.length === 1) {
            initialSelection[attr.slug] = attr.values[0].value;
          }
        }
      });
    } else if (product?.variantOptions?.length > 0) {
      product.variantOptions.forEach((optionGroup) => {
        if (Array.isArray(optionGroup.options) && optionGroup.options.length === 1) {
          initialSelection[optionGroup.key] = optionGroup.options[0].value;
        }
      });
    }
    setSelectedVariants(initialSelection);

    setActiveTab('description');
  }, [slug, product?.id]);

  const variantSelectionKeys = useMemo(() => {
    if (product?.variantAttributes?.length > 0) {
      return product.variantAttributes.map((attr) => attr.slug);
    }
    if (product?.variantOptions?.length > 0) {
      return product.variantOptions.map((optionGroup) => optionGroup.key);
    }
    return [];
  }, [product?.variantAttributes, product?.variantOptions]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    if (!variantSelectionKeys.length) return null;

    // Check if all required attributes are selected
    const allRequiredSelected = variantSelectionKeys.every(
      (key) => selectedVariants[key] !== undefined
    );

    if (!allRequiredSelected) return null;

    // Find variant that matches the selected combination
    return product.variants.find((variant) => {
      const rawCombination = Object.keys(variant.attributeCombination || {}).length > 0
        ? variant.attributeCombination
        : (variant.attributes || {});
      const normalizedCombination = product.variantAttributes?.length
        ? Object.entries(rawCombination).reduce((acc, [key, value]) => {
          const matchedAttribute = product.variantAttributes.find((attr) => attr.id === key || attr.slug === key);
          const normalizedKey = matchedAttribute?.slug || key;
          acc[normalizedKey] = value;
          return acc;
        }, {})
        : rawCombination;

      return variantSelectionKeys.every((key) => {
        const selectedValue = normalizeSelectionValue(selectedVariants[key]);
        const variantValue = normalizeSelectionValue(normalizedCombination[key]);
        return selectedValue === variantValue;
      });
    }) || null;
  }, [product, selectedVariants, variantSelectionKeys]);

  const displayImages = useMemo(() => {
    if (!product?.images) return [];

    // Ensure images is an array and extract URLs
    const productImages = Array.isArray(product.images)
      ? product.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean)
      : [];

    if (selectedVariant?.imageUrl) {
      return [selectedVariant.imageUrl, ...productImages.filter((image) => image !== selectedVariant.imageUrl)];
    }
    return productImages;
  }, [product?.images, selectedVariant]);

  useEffect(() => {
    if (displayImages.length === 0) return;
    if (!displayImages[selectedImage]) {
      setSelectedImage(0);
    }
  }, [displayImages, selectedImage]);

  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
  const currentStock = selectedVariant
    ? selectedVariant.quantity
    : hasVariants
      ? product?.stock || 0
      : product?.quantity || 0;
  const canSellWhenOutOfStock = product?.continueSellingWhenOutOfStock
    ?? product?.customFields?.continueSellingWhenOutOfStock
    ?? false;
  const isOutOfStock = currentStock <= 0;
  const canAddToCart = !isOutOfStock || canSellWhenOutOfStock;
  const basePrice = selectedVariant?.price ?? product?.price ?? 0;
  const comparePrice = (selectedVariant?.compareAtPrice ?? product?.comparePrice) > basePrice
    ? (selectedVariant?.compareAtPrice ?? product?.comparePrice)
    : null;
  const visibleBulkPricing = useMemo(
    () => (Array.isArray(product?.bulkPricing) ? product.bulkPricing.filter((rule) => rule.isActive !== false) : []),
    [product?.bulkPricing]
  );
  const activeBulkPricing = useMemo(() => {
    const rules = [...visibleBulkPricing].sort((a, b) => b.minQty - a.minQty);
    return rules.find((rule) => {
      const minQty = Number(rule.minQty) || 0;
      const maxQty = rule.maxQty ? Number(rule.maxQty) : null;
      return quantity >= minQty && (!maxQty || quantity <= maxQty) && (currentStock <= 0 || minQty <= currentStock);
    }) || null;
  }, [visibleBulkPricing, quantity, currentStock]);
  const currentPrice = activeBulkPricing?.price ?? basePrice;
  const discount = comparePrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;
  const displayRating = Number(product?.rating) || 0;
  const effectiveReviewCount = Math.max(Number(product?.reviewCount) || 0, reviews.length);
  const visibleReviewCount = reviews.length;
  const isShowingReviewSample = visibleReviewCount > 0 && effectiveReviewCount > visibleReviewCount;
  const descriptionMarkdown = useMemo(() => {
    const blocks = [];
    if (product?.description) blocks.push(product.description);
    if (product?.shortDescription) blocks.push(product.shortDescription);
    return blocks.join('\n\n');
  }, [product?.description, product?.shortDescription]);
  const featuresMarkdown = useMemo(() => {
    if (!product?.features) return '';
    if (typeof product.features === 'string') return product.features;
    if (Array.isArray(product.features)) {
      return product.features
        .map((feature) => String(feature || '').trim())
        .filter(Boolean)
        .map((feature) => `- ${feature}`)
        .join('\n');
    }
    return '';
  }, [product?.features]);
  const ratingBreakdown = useMemo(
    () => [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
      const percent = effectiveReviewCount > 0 ? Math.round((count / effectiveReviewCount) * 100) : 0;
      return { stars, percent };
    }),
    [reviews, effectiveReviewCount]
  );
  const productBenefits = useMemo(() => getProductBenefits(product), [product]);
  const wishlistEntry = wishlistItems.find(
    (item) => item.productId === product?.id && item.variantId === (selectedVariant?.id || null)
  );
  const isInWishlist = Boolean(wishlistEntry);

  useEffect(() => {
    if (currentStock <= 0 && !canSellWhenOutOfStock) {
      setQuantity(1);
      return;
    }

    if (currentStock > 0) {
      setQuantity((current) => Math.min(Math.max(current, 1), currentStock));
    } else {
      setQuantity((current) => Math.max(current, 1));
    }
  }, [currentStock, canSellWhenOutOfStock]);

  const handleAddToCart = async () => {
    if (!product?.id) return;

    if (variantSelectionKeys.length > 0) {
      const allRequiredSelected = variantSelectionKeys.every((key) => selectedVariants[key] !== undefined);

      if (!allRequiredSelected || !selectedVariant) {
        toast.error('Please select all product options first');
        return;
      }
    }

    if (currentStock <= 0 && !canSellWhenOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const desiredQuantity = currentStock > 0
        ? Math.max(1, Math.min(quantity, currentStock))
        : Math.max(1, quantity);
      const result = await addToCart(product, selectedVariant?.id || null, desiredQuantity);
      if (result?.success) {
        toast.success('Added to cart');
        return;
      }

      toast.error(result?.error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product?.id) return;

    if (variantSelectionKeys.length > 0) {
      const allRequiredSelected = variantSelectionKeys.every((key) => selectedVariants[key] !== undefined);

      if (!allRequiredSelected || !selectedVariant) {
        toast.error('Please select all product options first');
        return;
      }
    }

    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      navigate('/login', {
        state: {
          from: { pathname: window.location.pathname },
        },
      });
      return;
    }

    setIsWishlistUpdating(true);
    try {
      if (wishlistEntry?.id) {
        const result = await removeFromWishlist(wishlistEntry.id);
        if (result?.success) {
          toast.success('Removed from wishlist');
          return;
        }
        toast.error(result?.error || 'Failed to update wishlist');
        return;
      }

      const result = await addToWishlist(product, selectedVariant?.id || null);
      if (result?.success) {
        toast.success('Added to wishlist');
        return;
      }

      toast.error(result?.error || 'Failed to update wishlist');
    } finally {
      setIsWishlistUpdating(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Product',
          text: product?.shortDescription || 'Check this product',
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
        // Fallback to clipboard below.
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = shareUrl;
        tempInput.setAttribute('readonly', '');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      toast.success('Product link copied');
    } catch {
      window.prompt('Copy this product link:', shareUrl);
    } finally {
      setIsSharing(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!product?.id) return;
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please write your review');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await reviewAPI.createReview({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || undefined,
        comment: reviewForm.comment.trim(),
      });

      setMyReview(response?.data?.data || null);
      setReviewForm({ rating: 5, title: '', comment: '' });
      const refreshedProduct = await refreshProductSummary(product.slug);
      await loadProductReviews(refreshedProduct?.id || product.id);
      toast.success('Review submitted. It will appear after admin approval.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/products" className="hover:text-violet-600 transition-colors">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/categories/${product.categorySlug}`} className="hover:text-violet-600 transition-colors">{product.category}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-800 font-medium truncate max-w-48">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-zoom-in"
              onClick={() => setIsImageZoomed(true)}
            >
              <ImageWithFallback
                key={displayImages[selectedImage] || 'product-image'}
                src={displayImages[selectedImage]}
                alt={product.name}
                className="w-full h-full"
                loading="eager"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-500/25">
                  -{discount}%
                </span>
              )}
              {product.isFlashSale && (
                <span className="absolute top-4 left-4 mt-10 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg">
                  Flash Sale
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle();
                }}
                disabled={isWishlistUpdating}
                className={`absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 ${isInWishlist ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayImages.map((img, i) => (
                <button
                  type="button"
                  key={`thumb-${i}-${img}`}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedImage === i ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <ImageWithFallback src={img} alt="" className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-violet-600 font-medium mb-2">{product.brand}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(displayRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-slate-500">{displayRating.toFixed(1)} ({effectiveReviewCount} reviews)</span>
                <span className="text-slate-300">|</span>
                <span className={`text-sm font-medium ${currentStock > 0 ? 'text-emerald-600' : canSellWhenOutOfStock ? 'text-amber-600' : 'text-rose-600'}`}>
                  {currentStock > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                      In Stock ({currentStock})
                    </span>
                  ) : canSellWhenOutOfStock ? (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                      Limited Stock - Pre-order Available
                    </span>
                  ) : 'Out of Stock'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 flex-wrap">
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(currentPrice)}</span>
                {comparePrice && (
                  <>
                    <span className="text-xl text-slate-400 line-through">{formatCurrency(comparePrice)}</span>
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-sm font-semibold rounded-lg">
                      Save {formatCurrency(comparePrice - currentPrice)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed">{product.shortDescription}</p>
            </div>

            {/* Variants */}
            {product.variantOptions?.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {product.variantOptions.map((optionGroup) => (
                  <div key={optionGroup.key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {optionGroup.name}: <span className="text-violet-600">{selectedVariants[optionGroup.key] || 'Select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {optionGroup.options.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setSelectedVariants((values) => ({ ...values, [optionGroup.key]: opt.value }))}
                          className={`px-4 py-2 text-sm rounded-xl border transition-all ${selectedVariants[optionGroup.key] === opt.value
                            ? 'border-violet-500 bg-violet-50 text-violet-700 font-medium shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* {visibleBulkPricing.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Bundle Pricing</h3>
                  {activeBulkPricing && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Active tier: {formatCurrency(activeBulkPricing.price)} each
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {visibleBulkPricing
                    .slice()
                    .sort((a, b) => a.minQty - b.minQty)
                    .map((rule) => {
                      const isActiveTier = activeBulkPricing?.id === rule.id;
                      const rangeLabel = rule.maxQty
                        ? `${rule.minQty}-${rule.maxQty} units`
                        : `${rule.minQty}+ units`;
                      const isUnavailable = currentStock > 0 && Number(rule.minQty) > currentStock;

                      return (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() =>
                            setQuantity(() => {
                              const minQty = Number(rule.minQty) || 1;
                              return currentStock > 0 ? Math.min(currentStock, minQty) : minQty;
                            })
                          }
                          disabled={isUnavailable}
                          className={`text-left rounded-2xl border p-4 transition-all ${
                            isActiveTier
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          } ${isUnavailable ? 'opacity-50 cursor-not-allowed hover:border-slate-200 hover:bg-white' : ''}`}
                        >
                          <p className="text-sm font-semibold text-slate-900">{rangeLabel}</p>
                          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(rule.price)}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {rule.title || 'per unit'}
                          </p>
                          {rule.description && (
                            <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                          )}
                          {isUnavailable && (
                            <p className="text-xs text-amber-600 mt-2">Not enough stock for this tier</p>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )} */}
            {visibleBulkPricing.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Bundle Pricing
                  </h3>

                  {activeBulkPricing && (
                    <span className="text-[11px] font-medium text-white bg-emerald-500 px-2 py-0.5 rounded-full shadow-sm">
                      Active: {formatCurrency(activeBulkPricing.price)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {visibleBulkPricing
                    .slice()
                    .sort((a, b) => a.minQty - b.minQty)
                    .map((rule) => {
                      const isActiveTier = activeBulkPricing?.id === rule.id;

                      const rangeLabel = rule.maxQty
                        ? `${rule.minQty}-${rule.maxQty}`
                        : `${rule.minQty}+`;

                      const isUnavailable =
                        currentStock > 0 && Number(rule.minQty) > currentStock;

                      return (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() =>
                            setQuantity(() => {
                              const minQty = Number(rule.minQty) || 1;
                              return currentStock > 0
                                ? Math.min(currentStock, minQty)
                                : minQty;
                            })
                          }
                          disabled={isUnavailable}
                          className={`
              group flex items-center justify-between
              rounded-lg border px-3 py-2 text-left
              transition-all duration-200
              
              ${isActiveTier
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                              : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                            }

              ${isUnavailable
                              ? "opacity-40 cursor-not-allowed hover:bg-white hover:border-slate-200"
                              : "hover:scale-[1.02] hover:shadow-sm"
                            }
            `}
                        >
                          <span className="text-xs font-medium">
                            {rangeLabel} pcs
                          </span>

                          <span
                            className={`
                text-sm font-semibold
                ${isActiveTier
                                ? "text-emerald-700"
                                : "text-slate-900 group-hover:text-emerald-600"
                              }
              `}
                          >
                            {formatCurrency(rule.price)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}


            {/* Quantity & Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700">Quantity:</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-10 w-12 flex items-center justify-center text-sm font-semibold border-x border-slate-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => {
                        if (currentStock <= 0 && !canSellWhenOutOfStock) return q;
                        return canSellWhenOutOfStock || currentStock > 0 ? (currentStock > 0 ? Math.min(currentStock, q + 1) : q + 1) : q;
                      })
                    }
                    className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-400 hidden sm:block">
                  {currentStock > 0 ? `(${currentStock} available)` : canSellWhenOutOfStock ? '(Pre-order)' : '(Out of stock)'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isAddingToCart}
                  className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] disabled:opacity-60"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isAddingToCart
                    ? 'Adding...'
                    : canAddToCart
                      ? currentStock > 0
                        ? `Add to Cart - ${formatCurrency(currentPrice * quantity)}`
                        : `Pre-order - ${formatCurrency(currentPrice * quantity)}`
                      : 'Out of Stock'}
                </button>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={isWishlistUpdating}
                  className={`px-5 py-3.5 border border-slate-200 rounded-2xl transition-all ${isInWishlist ? 'text-rose-500 bg-rose-50 border-rose-200' : 'text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-rose-500'}`}
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="px-5 py-3.5 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Features */}
            {productBenefits.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                {productBenefits.map((benefit, index) => {
                  const fallbackIcon = DEFAULT_BENEFIT_ICON_SEQUENCE[index % DEFAULT_BENEFIT_ICON_SEQUENCE.length];
                  const IconComponent = getIconComponent(benefit.icon, fallbackIcon);

                  return (
                    <div key={`${benefit.label}-${index}`} className="text-center p-3 bg-slate-50 rounded-xl">
                      <IconComponent className="h-5 w-5 text-violet-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600 font-medium">{benefit.label}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SKU & Meta */}
            <div className="text-sm text-slate-400 space-y-1 pt-4 border-t border-slate-100">
              <p><span className="font-medium text-slate-500">SKU:</span> {selectedVariant?.sku || product.sku}</p>
              <p><span className="font-medium text-slate-500">Category:</span>{' '}
                <Link to={`/categories/${product.categorySlug}`} className="text-violet-600 hover:underline">
                  {product.category}
                </Link>
              </p>
              <p><span className="font-medium text-slate-500">Tags:</span> {product.tags.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
            {['description', 'features', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-all border-b-2 whitespace-nowrap ${activeTab === tab
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab === 'reviews' ? `Reviews (${effectiveReviewCount})` : tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-3xl text-slate-600 leading-relaxed space-y-4 animate-fade-in">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {descriptionMarkdown || 'No description provided.'}
              </ReactMarkdown>
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="max-w-3xl animate-fade-in">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {featuresMarkdown || 'No feature details available for this product yet.'}
              </ReactMarkdown>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-6 animate-fade-in">
              {/* Rating Summary */}
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl mb-8 flex-wrap">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{displayRating.toFixed(1)}</p>
                  <div className="flex items-center gap-1 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(displayRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{effectiveReviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-2 min-w-[200px]">
                  {ratingBreakdown.map(({ stars, percent }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-3">{stars}</span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isShowingReviewSample && (
                <p className="text-sm text-slate-500 -mt-4">
                  Showing the latest {visibleReviewCount} approved reviews.
                </p>
              )}

              <div className="p-6 border border-slate-100 rounded-2xl">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Write a Review</h3>
                {!isAuthenticated ? (
                  <p className="text-sm text-slate-600">
                    Please <Link to="/login" className="text-violet-600 hover:underline">log in</Link> to review this product.
                  </p>
                ) : myReview ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      You have already submitted a review for this product.
                    </p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${myReview.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {myReview.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <p className="text-sm text-slate-600">
                      You can edit or delete it from <Link to="/reviews" className="text-violet-600 hover:underline">My Reviews</Link>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star className={`h-5 w-5 ${star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Review title (optional)"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with this product..."
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleReviewSubmit}
                      disabled={isSubmittingReview}
                      className="px-4 py-2.5 text-sm font-medium rounded-xl bg-violet-600 text-white disabled:opacity-60"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews */}
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="p-6 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{review.user}</p>
                          <p className="text-xs text-slate-400">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <button className="text-xs text-slate-400 hover:text-violet-600 transition-colors">
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 border border-slate-100 rounded-2xl text-sm text-slate-500">
                  No reviews yet for this product.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                Related Products
              </h2>
              <Link to={`/categories/${product.categorySlug}`} className="text-sm text-violet-600 hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ProductsCardAll products={relatedProducts} />
          </div>
        )}
      </div>

      {/* Product Lightbox */}
      <ProductLightbox
        images={displayImages || []}
        isOpen={isImageZoomed}
        onClose={() => setIsImageZoomed(false)}
        initialIndex={selectedImage}
        productName={product?.name}
      />
    </div>
  );
};

export default ProductDetailPage;
