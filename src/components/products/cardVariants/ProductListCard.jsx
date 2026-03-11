import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { cn } from '../../../utils';
import { getButtonRadiusClass } from '../../../utils/themeHelpers';
import {
  getCategoryLabel,
  getProductImage,
  ProductBadges,
  ProductPrice,
  ProductRating,
} from './shared';

const ProductListCard = memo(({ product, theme, className = '' }) => (
  <article className={cn('group flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm hover-card md:flex-row', className)}>
    <div className="relative h-56 shrink-0 overflow-hidden bg-slate-50 md:h-auto md:w-56">
      <img
        src={getProductImage(product)}
        alt={product.name}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <ProductBadges product={product} className="absolute left-3 top-3 z-10" />
    </div>
    <div className="flex flex-1 flex-col justify-between gap-4 p-5">
      <div>
        <ProductRating product={product} className="mb-3" />
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="mb-2 text-base font-medium text-slate-900 transition-colors group-hover:text-primary-700">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-slate-500">
          {product.shortDescription || product.description || 'Learn more about this product and see full specifications.'}
        </p>
        <p className="text-xs text-slate-400">
          {product.brand || 'Signature'} • {getCategoryLabel(product)}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProductPrice product={product} priceClassName="text-lg" />
        <Link
          to={`/products/${product.slug}`}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5',
            getButtonRadiusClass(theme?.buttonStyle)
          )}
          style={{ backgroundColor: 'var(--color-primary-600)' }}
        >
          <ShoppingCart className="h-4 w-4" /> View Details
        </Link>
      </div>
    </div>
  </article>
));

ProductListCard.displayName = 'ProductListCard';

export default ProductListCard;
