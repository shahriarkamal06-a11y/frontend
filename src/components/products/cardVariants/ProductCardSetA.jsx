import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../utils';
import {
  getCategoryLabel,
  getProductCardScale,
  ProductCardLinkOverlay,
  ProductImageSwap,
  ProductActionButtons,
  ProductBadges,
  ProductPrice,
  ProductPrimaryLink,
  ProductRating,
  ProductSecondaryText,
  ProductStockStatus,
  useProductCardActions,
} from './shared';

export const EditorialProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const brandLabel = product?.brand || getCategoryLabel(product);
  const scale = getProductCardScale(theme);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_38px_-30px_rgba(15,23,42,0.4)] hover-card',
        className
      )}
    >
      <div className="relative overflow-hidden bg-slate-50">
        <div className={cn('aspect-[1/0.95] overflow-hidden', scale.imageAspectClassName)}>
          <ProductImageSwap
            product={product}
            imgClassName="transition duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-4 top-4 z-20" />
        <ProductActionButtons
          product={product}
          theme={theme}
          actions={actions}
          className="absolute right-4 top-4 z-20"
          gapClassName={scale.actionGapClassName}
          sizeClassName={scale.actionSizeClassName}
          iconSizeClassName={scale.actionIconSizeClassName}
          iconClassName="rounded-2xl bg-white text-slate-700 shadow-md hover:bg-white hover:text-slate-900"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/15 via-slate-950/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
        <div className="absolute inset-x-4 bottom-4 z-20 opacity-100 transition-all duration-300 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
          <Link
            to={`/products/${product.slug}`}
            className={cn(
              'block rounded-2xl bg-slate-900 text-center font-semibold text-white backdrop-blur-sm transition-colors hover:bg-slate-800',
              scale.primaryLinkClassName || 'px-4 py-3 text-sm'
            )}
          >
            View Product
          </Link>
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, 'px-5 pb-5 pt-4', scale.isDense && 'px-4 pb-4')}>
        <ProductRating product={product} textClassName={scale.ratingTextClassName} />
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className={cn('mb-1 line-clamp-2 text-slate-800 transition-colors group-hover:text-violet-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>
            {product.name}
          </h3>
        </Link>
        <p className={cn('text-slate-600', scale.metaClassName)}>{brandLabel}</p>
        <ProductPrice
          product={product}
          className="items-end gap-2.5"
          priceClassName={cn('font-bold leading-none', scale.priceClassName)}
          compareClassName={cn('font-medium text-slate-400', scale.compareClassName)}
        />
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const SpotlightProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden border border-slate-200 bg-gradient-to-b from-white via-white to-slate-50 shadow-sm hover-card', className)}>
      <div className={cn('relative aspect-square overflow-hidden bg-slate-100', scale.imageAspectClassName)}>
        <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        <div className="absolute bottom-3 right-3 z-20">
          <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} />
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, scale.bodyPaddingClassName)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <ProductSecondaryText product={product} className={cn('mb-1', scale.metaClassName)} />
            <Link to={`/products/${product.slug}`} className="block">
              <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.heroTitleClassName, scale.isUltraDense && 'line-clamp-1')}>
                {product.name}
              </h3>
            </Link>
          </div>
          <ProductRating product={product} className="shrink-0" textClassName={cn(scale.ratingTextClassName, scale.isDense && 'hidden sm:inline')} />
        </div>
        <p className={cn('text-slate-500', scale.descriptionClassName, scale.isDense && 'hidden sm:block')}>
          {product.shortDescription || product.description || 'Discover one of the most-loved items in this collection.'}
        </p>
        <div className="flex items-center justify-between gap-3">
          <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
          <ProductStockStatus product={product} />
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const CompactProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm hover-card', className)}>
      <div className={cn('relative aspect-[5/4] overflow-hidden bg-slate-50', scale.imageAspectClassName)}>
        <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-2.5 top-2.5 z-20" />
        <div className="absolute bottom-2.5 right-2.5 z-20">
          <ProductActionButtons
            product={product}
            theme={theme}
            actions={actions}
            orientation="row"
            gapClassName={scale.actionGapClassName}
            sizeClassName={scale.actionSizeClassName}
            iconSizeClassName={scale.actionIconSizeClassName}
            iconClassName="rounded-full bg-white shadow-md"
          />
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, scale.compactBodyPaddingClassName)}>
        <div className="min-w-0">
          <ProductSecondaryText product={product} className={cn('mb-1 line-clamp-1 uppercase tracking-[0.14em]', scale.metaClassName)} />
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
          <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
          <ProductRating product={product} textClassName={cn(scale.ratingTextClassName, 'hidden sm:inline')} />
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const SoftProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden border border-white bg-slate-50/80 shadow-sm ring-1 ring-slate-200/70 hover-card', className)}>
      <div className="relative m-3 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-100/80 to-transparent" />
        <div className={cn('relative aspect-square overflow-hidden', scale.imageAspectClassName)}>
          <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        </div>
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        <div className="absolute bottom-3 right-3 z-20">
          <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} />
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, 'px-4 pb-4', scale.isDense && 'px-3.5 pb-3.5')}>
        <ProductRating product={product} textClassName={scale.ratingTextClassName} />
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>
            {product.name}
          </h3>
        </Link>
        <ProductSecondaryText product={product} className={scale.metaClassName} />
        <div className="flex items-center justify-between gap-3">
          <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
          {!scale.isUltraDense && (
            <ProductPrimaryLink product={product} theme={theme} desktopReveal className={scale.primaryLinkClassName}>
              View <ArrowRight className="h-3.5 w-3.5" />
            </ProductPrimaryLink>
          )}
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

EditorialProductCard.displayName = 'EditorialProductCard';
SpotlightProductCard.displayName = 'SpotlightProductCard';
CompactProductCard.displayName = 'CompactProductCard';
SoftProductCard.displayName = 'SoftProductCard';
