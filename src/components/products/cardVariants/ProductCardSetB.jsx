import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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

export const GlassProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80 shadow-sm backdrop-blur-md hover-card', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/60 via-transparent to-accent/10" />
      <div className={cn('relative aspect-[4/5] overflow-hidden', scale.imageAspectClassName)}>
        <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        <div className="absolute right-3 top-3 z-20">
          <ProductActionButtons product={product} theme={theme} actions={actions} gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} iconClassName="bg-white/95 text-slate-700 hover:bg-white hover:text-slate-900" />
        </div>
        <div className={cn('absolute inset-x-0 bottom-0 z-20 p-4 text-white', scale.sectionGapClassName, scale.isDense && 'p-3')}>
          <ProductRating product={product} textClassName={cn('text-white/70', scale.ratingTextClassName)} />
          <h3 className={cn('line-clamp-2', scale.heroTitleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
          <ProductPrice product={product} priceClassName={cn('text-white', scale.heroPriceClassName)} compareClassName={cn('text-white/60', scale.compareClassName)} />
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const GalleryProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm hover-card', className)}>
      <div className="grid grid-cols-[1fr_auto]">
        <div className={cn('relative aspect-[4/5] overflow-hidden bg-slate-100', scale.imageAspectClassName)}>
          <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
          <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        </div>
        <div className="flex flex-col justify-between border-l border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-3">
          <ProductActionButtons product={product} theme={theme} actions={actions} gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} iconClassName="border border-slate-200 bg-white shadow-md" className="relative z-20" />
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, scale.compactBodyPaddingClassName)}>
        <ProductSecondaryText product={product} className={scale.metaClassName} />
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between gap-3">
          <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
          <ProductRating product={product} textClassName={scale.ratingTextClassName} />
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const OutlineProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative overflow-hidden rounded-[1.35rem] border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-primary-400 hover-card', className)}>
      <div className="relative overflow-hidden border-b-2 border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%),_#f8fafc]">
        <div className={cn('aspect-square overflow-hidden', scale.imageAspectClassName)}>
          <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        </div>
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        <div className="absolute right-3 top-3 z-20">
          <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} iconClassName="border border-slate-200 bg-white shadow-md" />
        </div>
      </div>
      <div className={cn(scale.sectionGapClassName, scale.compactBodyPaddingClassName)}>
        <div className="rounded-2xl border border-dashed border-slate-200 p-3">
          <ProductRating product={product} className="mb-2" textClassName={scale.ratingTextClassName} />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/products/${product.slug}`} className="block">
                <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.titleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
              </Link>
            </div>
            {!scale.isUltraDense && (
              <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} className="shrink-0 flex-col items-end gap-0.5" />
            )}
          </div>
        </div>
        <ProductSecondaryText product={product} className={scale.metaClassName} />
        <div className="flex items-center justify-between gap-3">
          {scale.isUltraDense ? (
            <ProductPrice product={product} priceClassName={scale.priceClassName} compareClassName={scale.compareClassName} />
          ) : (
            <ProductPrimaryLink product={product} theme={theme} desktopReveal className={scale.primaryLinkClassName}>
              Buy Now
            </ProductPrimaryLink>
          )}
          {!scale.isUltraDense && (
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Framed edit
            </span>
          )}
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

export const SplitProductCard = memo(({ product, theme, className = '' }) => {
  const actions = useProductCardActions(product);
  const scale = getProductCardScale(theme);

  return (
    <article className={cn('group relative grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm hover-card md:grid-cols-[1.1fr_0.9fr]', scale.isUltraDense && 'grid-cols-1', className)}>
      <div className={cn('relative min-h-[240px] overflow-hidden bg-slate-100', scale.isUltraDense && 'min-h-[200px]')}>
        <ProductImageSwap product={product} imgClassName="transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/35 via-transparent to-transparent" />
        <ProductBadges product={product} badgeClassName={scale.badgeClassName} className="absolute left-3 top-3 z-20" />
        <div className="absolute bottom-3 right-3 z-20">
          <ProductActionButtons product={product} theme={theme} actions={actions} orientation="row" gapClassName={scale.actionGapClassName} sizeClassName={scale.actionSizeClassName} iconSizeClassName={scale.actionIconSizeClassName} />
        </div>
      </div>
      <div className={cn('flex flex-col justify-between', scale.sectionGapClassName, scale.bodyPaddingClassName)}>
        <div>
          <ProductSecondaryText product={product} className={cn('mb-2 uppercase tracking-[0.18em]', scale.metaClassName)} />
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className={cn('line-clamp-2 text-slate-900 transition-colors group-hover:text-primary-700', scale.heroTitleClassName, scale.isUltraDense && 'line-clamp-1')}>{product.name}</h3>
          </Link>
          <p className={cn('mt-3 text-slate-500', scale.descriptionClassName, scale.isDense && 'line-clamp-2')}>
            {product.shortDescription || product.description || 'Built for everyday use with a refined finish and reliable comfort.'}
          </p>
        </div>
        <div className={cn(scale.sectionGapClassName, 'pt-1')}>
          <ProductRating product={product} textClassName={scale.ratingTextClassName} />
          <ProductPrice product={product} priceClassName={scale.heroPriceClassName} compareClassName={scale.compareClassName} />
          <div className="flex items-center justify-between gap-3">
            <ProductPrimaryLink product={product} theme={theme} desktopReveal className={cn('gap-2', scale.primaryLinkClassName)}>
              Details <ArrowRight className="h-4 w-4" />
            </ProductPrimaryLink>
            {!scale.isUltraDense && (
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Split view
              </span>
            )}
          </div>
        </div>
      </div>
      <ProductCardLinkOverlay product={product} />
    </article>
  );
});

GlassProductCard.displayName = 'GlassProductCard';
GalleryProductCard.displayName = 'GalleryProductCard';
OutlineProductCard.displayName = 'OutlineProductCard';
SplitProductCard.displayName = 'SplitProductCard';
