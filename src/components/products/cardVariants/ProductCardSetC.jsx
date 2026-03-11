import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../../utils';
import {
  getProductCardScale,
  ProductCardLinkOverlay,
  ProductImageSwap,
  ProductActionButtons,
  ProductBadges,
  ProductPrice,
  ProductPrimaryLink,
  ProductRating,
  ProductSecondaryText,
  useProductCardActions,
} from './shared';

export const StackedProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm hover-card', className)}>
      <div className="absolute inset-x-5 top-5 h-full rounded-[2rem] bg-slate-100/70" />
      <div className="absolute inset-x-3 top-3 h-full rounded-[2rem] border border-slate-100 bg-white/70" />
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
        <div className={cn('relative aspect-[4/5] overflow-hidden bg-slate-50', scale.imageAspectClassName)}>
          <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
          <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        </div>
        <div className={cn('-mt-8 mx-3 rounded-[1.4rem] border border-slate-100 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-sm', scale.sectionGapClassName, scale.isDense && '-mt-6 p-3')}>
          <ProductRating product={product} textClassName={scale.ratingTextClassName} />
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
          </Link>
          <div className="flex items-center justify-between gap-3">
            <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
            <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} className="relative z-20" />
          </div>
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const LuxeProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.6rem] border border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-white shadow-sm hover-card', className)}>
      <div className={cn('relative aspect-[4/5] overflow-hidden bg-slate-100', scale.imageAspectClassName)}>
        <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/50 via-transparent to-transparent" />
        <div className={cn('absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/85 font-semibold uppercase tracking-[0.2em] text-amber-800 backdrop-blur-sm', scale.badgeClassName || 'px-3 py-1 text-[11px]')}>
          <Sparkles className="h-3 w-3" /> Signature
        </div>
        <div className="absolute right-3 top-3 z-20">
          <ProductActionButtons product={product} theme={theme} actions={actions} gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} iconClassName="bg-white text-slate-700 shadow-md hover:bg-white hover:text-slate-900" />
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, scale.bodyPaddingClassName)}>
        <ProductSecondaryText product={product} className={cn('uppercase tracking-[0.18em] text-amber-700/70', scale.metaClassName)} />
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-amber-700', scale.heroTitleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
        </Link>
        <ProductRating product={product} textClassName={scale.ratingTextClassName} />
        <div className="flex items-center justify-between gap-3">
          <ProductPrice product={product} priceClassName={scale.heroPriceClassName} compareClassName={scale.compareClassName} />
          <ProductPrimaryLink product={product} theme={theme} desktopReveal className={scale.primaryLinkClassName}>
            Reserve
          </ProductPrimaryLink>
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const MinimalCardProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-sm hover-card', className)}>
      <div className={cn('relative aspect-square overflow-hidden bg-slate-50', scale.imageAspectClassName)}>
        <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/40 to-transparent" />
      </div>
      <div className={cn(scale.sectionGapClassName, scale.compactBodyPaddingClassName)}>
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className={cn('line-clamp-2 font-medium text-slate-900 transition-colors group-hover:text-primary-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
        </Link>
        <ProductSecondaryText product={product} className={cn('uppercase tracking-[0.16em]', scale.metaClassName)} />
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
          <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
          <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} iconClassName="border border-slate-200 bg-white shadow-md" className="relative z-20" />
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const BannerProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm hover-card', className)}>
      <div className={cn('relative min-h-[280px] overflow-hidden', scale.isUltraDense && 'min-h-[220px]')}>
        <ProductImageSwap product={product} className="absolute inset-0" imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
        <div className={cn('relative flex min-h-[280px] flex-col justify-between text-white', scale.bodyPaddingClassName, scale.isUltraDense && 'min-h-[220px]')}>
          <div className="flex items-start justify-between gap-3">
            <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="relative z-20" />
            <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} iconClassName="bg-white text-slate-700 shadow-md hover:bg-white hover:text-slate-900" className="relative z-20" />
          </div>
          <div className={cn(scale.sectionGapClassName, 'max-w-[85%]', scale.isUltraDense && 'max-w-full')}>
            <ProductRating product={product} textClassName={cn('text-white/70', scale.ratingTextClassName)} />
            <Link to={`/products/${product.slug}`} className="block">
              <h3 className={cn('line-clamp-2', scale.displayTitleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
            </Link>
            <p className={cn('text-white/75', scale.descriptionClassName, scale.isDense && 'hidden sm:block')}>
              {product.shortDescription || product.description || 'A standout pick with strong visual impact and premium finishing details.'}
            </p>
            <div className="flex items-center justify-between gap-4">
              <ProductPrice product={product} priceClassName={cn('text-white', scale.heroPriceClassName)} compareClassName={cn('text-white/60', scale.compareClassName)} />
              <ProductPrimaryLink product={product} theme={theme} desktopReveal className={cn('gap-2 !text-slate-950', scale.primaryLinkClassName)} style={{ backgroundColor: '#ffffff' }}>
                Explore <ArrowRight className="h-4 w-4" />
              </ProductPrimaryLink>
            </div>
          </div>
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

StackedProductCard.displayName = 'StackedProductCard';
LuxeProductCard.displayName = 'LuxeProductCard';
MinimalCardProductCard.displayName = 'MinimalCardProductCard';
BannerProductCard.displayName = 'BannerProductCard';
