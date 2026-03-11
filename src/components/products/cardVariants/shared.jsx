import { Link, useNavigate } from 'react-router-dom';
import { Eye, Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn, formatCurrency } from '../../../utils';
import { getButtonRadiusClass, getNormalizedProductGridConfig } from '../../../utils/themeHelpers';
import { useAuthStore, useCartStore, useWishlistStore } from '../../../store';

const resolveProductImage = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value?.url) return value.url;
  return null;
};

export const getProductImage = (product) => {
  const firstImage = resolveProductImage(product?.images?.[0]);
  if (firstImage) return firstImage;
  if (product?.imageUrl) return product.imageUrl;
  if (product?.image) return product.image;
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
};

export const getProductHoverImage = (product) => {
  const images = Array.isArray(product?.images) ? product.images : [];
  const hoverImage = resolveProductImage(images[1]);
  return hoverImage || null;
};

export const getComparePrice = (product) => {
  const price = Number(product?.price);
  const comparePrice = Number(product?.comparePrice ?? product?.compareAtPrice);

  if (!Number.isFinite(price) || !Number.isFinite(comparePrice)) return null;
  if (comparePrice <= price) return null;

  return comparePrice;
};

export const getRating = (product) => {
  const rating = Number(product?.rating ?? product?.avgRating ?? product?.avg_rating);
  return Number.isFinite(rating) ? rating : 0;
};

export const getReviewCount = (product) => {
  const reviewCount = Number(product?.reviewCount ?? product?.review_count);
  return Number.isFinite(reviewCount) ? reviewCount : 0;
};

const resolveTrackQuantity = (product) => {
  const rawValue =
    product?.trackQuantity ??
    product?.customFields?.trackQuantity ??
    product?.custom_fields?.trackQuantity;
  return rawValue !== false;
};

export const getContinueSellingWhenOutOfStock = (product) => Boolean(
  product?.continueSellingWhenOutOfStock ??
  product?.customFields?.continueSellingWhenOutOfStock ??
  product?.custom_fields?.continueSellingWhenOutOfStock
);

export const getProductStock = (product) => {
  if (!product) return 0;
  if (!resolveTrackQuantity(product)) return null;
  const numericStock = Number(product?.stock);
  if (Number.isFinite(numericStock)) return numericStock;
  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants
      .filter((variant) => variant.isActive !== false)
      .reduce((sum, variant) => sum + (Number(variant.quantity) || 0), 0);
  }
  return Number(product?.quantity) || 0;
};

export const getCategoryLabel = (product) => product?.category || product?.categoryName || 'Uncategorized';

export const getDiscount = (product) => {
  const comparePrice = getComparePrice(product);
  if (!comparePrice) return 0;
  return Math.round(((comparePrice - product.price) / comparePrice) * 100);
};

export const getProductCardDensity = (theme = {}) => {
  const gridConfig = getNormalizedProductGridConfig(theme);
  let score = 0;

  if (gridConfig.desktopColumns >= 8) {
    score += 3;
  } else if (gridConfig.desktopColumns >= 6) {
    score += 2;
  } else if (gridConfig.desktopColumns >= 5) {
    score += 1;
  }

  if (gridConfig.rows >= 6) {
    score += 2;
  } else if (gridConfig.rows >= 5) {
    score += 1;
  }

  if (gridConfig.cardSize === 'compact') {
    score += 1;
  }

  if (gridConfig.cardSize === 'spacious') {
    score -= 1;
  }

  if (score >= 4) return 'ultra';
  if (score >= 2) return 'dense';
  return 'regular';
};

export const getProductCardScale = (theme = {}) => {
  const density = getProductCardDensity(theme);
  const isDense = density !== 'regular';
  const isUltraDense = density === 'ultra';

  return {
    density,
    isDense,
    isUltraDense,
    badgeClassName: isUltraDense ? 'px-1.5 py-0.5 text-[8px]' : isDense ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]',
    actionSizeClassName: isUltraDense ? 'h-7 w-7' : isDense ? 'h-8 w-8' : 'h-9 w-9',
    actionIconSizeClassName: isUltraDense ? 'h-3 w-3' : isDense ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5',
    actionGapClassName: isUltraDense ? 'gap-1' : isDense ? 'gap-1.5' : 'gap-1.5',
    bodyPaddingClassName: isUltraDense ? 'p-2.5' : isDense ? 'p-3' : 'p-4',
    compactBodyPaddingClassName: isUltraDense ? 'p-2.5' : isDense ? 'p-3' : 'p-3.5',
    sectionGapClassName: isUltraDense ? 'space-y-1.5' : isDense ? 'space-y-2' : 'space-y-2.5',
    titleClassName: isUltraDense ? 'text-[11px] font-medium' : isDense ? 'text-xs font-medium' : 'text-xs font-medium',
    heroTitleClassName: isUltraDense ? 'text-xs font-medium' : isDense ? 'text-sm font-medium' : 'text-sm font-semibold',
    displayTitleClassName: isUltraDense ? 'text-sm font-semibold' : isDense ? 'text-base font-semibold' : 'text-base font-semibold',
    metaClassName: isUltraDense ? 'text-[10px]' : isDense ? 'text-[10px]' : 'text-[10px]',
    descriptionClassName: isUltraDense ? 'line-clamp-1 text-[10px]' : isDense ? 'line-clamp-2 text-[10px]' : 'line-clamp-2 text-[10px]',
    priceClassName: isUltraDense ? 'text-xs' : isDense ? 'text-sm' : 'text-sm',
    heroPriceClassName: isUltraDense ? 'text-sm' : isDense ? 'text-base' : 'text-base',
    compareClassName: isUltraDense ? 'text-[9px]' : isDense ? 'text-[10px]' : 'text-[10px]',
    ratingTextClassName: isUltraDense ? 'hidden' : '',
    imageAspectClassName: isUltraDense ? 'aspect-square' : isDense ? 'aspect-[4/5]' : '',
    primaryLinkClassName: isUltraDense ? 'px-2.5 py-1.5 text-[10px]' : isDense ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs',
  };
};

export const ProductImageSwap = ({ product, className = '', imgClassName = '', loading = 'lazy', decoding = 'async' }) => {
  const primaryImage = getProductImage(product);
  const hoverImage = getProductHoverImage(product);

  if (!hoverImage) {
    return (
      <img
        src={primaryImage}
        alt={product?.name || 'Product'}
        className={cn('h-full w-full object-cover', imgClassName, className)}
        loading={loading}
        decoding={decoding}
      />
    );
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <img
        src={primaryImage}
        alt={product?.name || 'Product'}
        className={cn('h-full w-full object-cover transition-opacity duration-500', imgClassName, 'opacity-100 group-hover:opacity-0')}
        loading={loading}
        decoding={decoding}
      />
      <img
        src={hoverImage}
        alt={product?.name || 'Product'}
        className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', imgClassName, 'opacity-0 group-hover:opacity-100')}
        loading={loading}
        decoding={decoding}
      />
    </div>
  );
};

export const ProductCardLinkOverlay = ({ product, className = '' }) => (
  <Link
    to={`/products/${product?.slug}`}
    aria-label={product?.name ? `View ${product.name}` : 'View product'}
    className={cn('absolute inset-0 z-10', className)}
  />
);

export function useProductCardActions(product) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);

  const wishlistEntry = wishlistItems.find(
    (item) => item.productId === product?.id && !item.variantId
  );
  const isInWishlist = Boolean(wishlistEntry);

  const openProductDetails = () => {
    if (!product?.slug) return;
    navigate(`/products/${product.slug}`);
  };

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product?.id) return;
    if (product?.requiresVariantSelection || product?.variants?.length > 0) {
      navigate(`/products/${product.slug}`);
      toast.error('Select product options before saving to wishlist');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      navigate('/login', {
        state: {
          from: {
            pathname: window.location.pathname,
            search: window.location.search,
          },
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

      const result = await addToWishlist(product, null);
      if (result?.success) {
        toast.success('Added to wishlist');
        return;
      }

      toast.error(result?.error || 'Failed to update wishlist');
    } finally {
      setIsWishlistUpdating(false);
    }
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product?.id) return;
    if (product?.requiresVariantSelection || product?.variants?.length > 0) {
      navigate(`/products/${product.slug}`);
      toast.error('Select product options on the product page');
      return;
    }
    
    const currentStock = getProductStock(product);
    const canSellWhenOutOfStock = getContinueSellingWhenOutOfStock(product);
    const isOutOfStock = currentStock !== null && currentStock <= 0;
    
    if (isOutOfStock && !canSellWhenOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(product, null, 1);
      if (result?.success) {
        toast.success('Added to cart');
        return;
      }

      toast.error(result?.error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return {
    isAddingToCart,
    isWishlistUpdating,
    isInWishlist,
    openProductDetails,
    handleWishlistToggle,
    handleAddToCart,
  };
}

export const ProductBadges = ({ product, className = '', badgeClassName = '' }) => {
  const comparePrice = getComparePrice(product);
  const discount = getDiscount(product);

  return (
    <div className={cn('flex flex-col gap-1.5 text-1xl', className)}>
      {product.section && (
        <span className={cn('badge bg-gradient-to-r from-blue-500 to-indigo-500 text-white capitalize shadow-lg shadow-blue-500/20', badgeClassName)}>
          {product.sectionName || product.section.replace(/-/g, ' ')}
        </span>
      )}
      {comparePrice && (
        <span className={cn('badge bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20', badgeClassName)}>
          {discount}% OFF
        </span>
      )}
      {product.isFlashSale && (
        <span className={cn('badge flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20', badgeClassName)}>
          <Zap className="h-3 w-3" /> Flash
        </span>
      )}
    </div>
  );
};

export const ProductRating = ({ product, className = '', textClassName = '', iconClassName = '' }) => {
  const rating = getRating(product);
  const reviewCount = getReviewCount(product);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={cn(
            'h-3 w-3',
            iconClassName,
            index < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          )}
        />
      ))}
      <span className={cn('ml-1 text-[11px] text-slate-400', textClassName)}>({reviewCount})</span>
    </div>
  );
};

export const ProductPrice = ({ product, className = '', priceClassName = '', compareClassName = '' }) => {
  const comparePrice = getComparePrice(product);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold text-slate-900', priceClassName)}>
        {formatCurrency(product.price)}
      </span>
      {comparePrice && (
        <span className={cn('text-xs text-slate-400 line-through', compareClassName)}>
          {formatCurrency(comparePrice)}
        </span>
      )}
    </div>
  );
};

export const ProductStockStatus = ({ product, className = '' }) => {
  const currentStock = getProductStock(product);
  const canSellWhenOutOfStock = getContinueSellingWhenOutOfStock(product);
  
  if (currentStock === null) {
    return (
      <span className={cn('text-xs text-emerald-600 font-medium', className)}>
        In Stock
      </span>
    );
  }

  if (currentStock > 0) {
    return (
      <span className={cn('text-xs text-emerald-600 font-medium', className)}>
        In Stock ({currentStock})
      </span>
    );
  }
  
  if (canSellWhenOutOfStock) {
    return (
      <span className={cn('text-xs text-amber-600 font-medium', className)}>
        Limited Stock - Pre-order
      </span>
    );
  }
  
  return (
    <span className={cn('text-xs text-rose-600 font-medium', className)}>
      Out of Stock
    </span>
  );
};

export const ProductActionButtons = ({
  product,
  theme,
  actions,
  orientation = 'column',
  revealOnDesktopHover = true,
  className = '',
  gapClassName = '',
  sizeClassName = '',
  iconSizeClassName = '',
  iconClassName = '',
}) => {
  const radiusClass = getButtonRadiusClass(theme?.buttonStyle);
  const currentStock = getProductStock(product);
  const canSellWhenOutOfStock = getContinueSellingWhenOutOfStock(product);
  const canAddToCart = currentStock === null || currentStock > 0 || canSellWhenOutOfStock;
  
  const sharedClassName = cn(
    'flex items-center justify-center bg-white text-slate-700 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:text-slate-900',
    sizeClassName || 'h-10 w-10',
    radiusClass,
    iconClassName
  );

  return (
    <div
      className={cn(
        orientation === 'row' ? 'flex items-center' : 'flex flex-col',
        gapClassName || 'gap-2',
        revealOnDesktopHover && 'opacity-100 translate-y-0 lg:pointer-events-none lg:translate-y-3 lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100',
        className
      )}
    >
      <button
        type="button"
        onClick={actions.handleWishlistToggle}
        disabled={actions.isWishlistUpdating}
        className={cn(
          sharedClassName,
          actions.isInWishlist ? 'text-rose-500' : 'hover:text-rose-500',
          actions.isWishlistUpdating && 'cursor-not-allowed opacity-60'
        )}
      >
        <Heart className={cn('h-4 w-4', iconSizeClassName)} />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          actions.openProductDetails();
        }}
        className={cn(sharedClassName, 'hover:text-primary-600')}
      >
        <Eye className={cn('h-4 w-4', iconSizeClassName)} />
      </button>
      <button
        type="button"
        onClick={actions.handleAddToCart}
        disabled={actions.isAddingToCart || !canAddToCart}
        className={cn(
          sharedClassName,
          'hover:text-emerald-600',
          (actions.isAddingToCart || !canAddToCart) && 'cursor-not-allowed opacity-60'
        )}
      >
        <ShoppingCart className={cn('h-4 w-4', iconSizeClassName)} />
      </button>
    </div>
  );
};

export const ProductPrimaryLink = ({ product, theme, children, className = '', style, desktopReveal = false }) => (
  <Link
    to={`/products/${product.slug}`}
    className={cn(
      'inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5',
      desktopReveal && 'opacity-100 lg:pointer-events-none lg:translate-y-3 lg:opacity-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100',
      getButtonRadiusClass(theme?.buttonStyle),
      className
    )}
    style={{ backgroundColor: 'var(--color-primary-600)', ...style }}
  >
    {children}
  </Link>
);

export const ProductSecondaryText = ({ product, className = '' }) => (
  <p className={cn('text-[11px] text-slate-400', className)}>
    {product.brand || 'Signature'} {product.brand && getCategoryLabel(product) ? ' / ' : ''}
    {getCategoryLabel(product)}
  </p>
);
