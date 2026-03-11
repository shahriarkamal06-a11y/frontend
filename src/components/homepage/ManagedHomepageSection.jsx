import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ProductsCardAll from '../products/ProductsCardAll';
import { getIconComponent } from '../../utils/iconUtils';
import { HOMEPAGE_SECTION_TYPES, normalizeHomepageSectionType } from '../../utils/homepageSections';
import { resolveMediaUrl, isImageValue } from '../../utils/mediaHelpers';

const SECTION_ICON_FALLBACK = {
  featured: 'Star',
  'flash-sale': 'Zap',
  'new-arrivals': 'Sparkles',
  'best-sellers': 'TrendingUp',
  trending: 'Flame',
};

const TONE_STYLES = {
  violet: {
    accent: 'bg-gradient-to-br from-violet-500 to-violet-600',
    soft: 'bg-violet-50 text-violet-700',
    primary: 'bg-white text-slate-900 hover:bg-slate-100',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    section: 'bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900',
  },
  amber: {
    accent: 'bg-gradient-to-br from-amber-500 to-orange-500',
    soft: 'bg-amber-50 text-amber-700',
    primary: 'bg-amber-500 text-white hover:bg-amber-600',
    secondary: 'bg-white text-slate-900 hover:bg-slate-100',
    section: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
  },
  emerald: {
    accent: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    soft: 'bg-emerald-50 text-emerald-700',
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600',
    secondary: 'bg-white text-slate-900 hover:bg-slate-100',
    section: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50',
  },
  rose: {
    accent: 'bg-gradient-to-br from-rose-500 to-pink-600',
    soft: 'bg-rose-50 text-rose-700',
    primary: 'bg-rose-500 text-white hover:bg-rose-600',
    secondary: 'bg-white text-slate-900 hover:bg-slate-100',
    section: 'bg-gradient-to-br from-rose-50 via-white to-pink-50',
  },
  blue: {
    accent: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    soft: 'bg-blue-50 text-blue-700',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-white text-slate-900 hover:bg-slate-100',
    section: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
  },
  slate: {
    accent: 'bg-gradient-to-br from-slate-500 to-slate-700',
    soft: 'bg-slate-100 text-slate-700',
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-white text-slate-900 hover:bg-slate-100',
    section: 'bg-white',
  },
};

const renderSectionIcon = (rawIcon, fallbackIcon) => {
  if (isImageValue(rawIcon)) {
    const imageUrl = resolveMediaUrl(rawIcon);
    if (imageUrl) {
      return <img src={imageUrl} alt="" className="h-9 w-9 rounded-[10px] object-contain bg-white/80 p-1" loading="lazy" />;
    }
  }

  const IconComponent = getIconComponent(rawIcon, fallbackIcon);
  return <IconComponent className="h-5 w-5 text-white" />;
};

const ActionButton = ({ href, label, className = '' }) => {
  if (!href || !label) return null;

  return (
    <Link to={href}>
      <button className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition ${className}`}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </button>
    </Link>
  );
};

const SectionHeader = ({ section, toneStyles, index, isVisible }) => {
  const fallbackIcon = SECTION_ICON_FALLBACK[section.slug] || 'Package';

  return (
    <div className={`mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div>
        {section.content?.badge && (
          <span className={`mb-4 inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${toneStyles.soft}`}>
            {section.content.badge}
          </span>
        )}
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles.accent}`}>
            {renderSectionIcon(section.icon, fallbackIcon)}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 lg:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            {section.name}
          </h2>
        </div>
        {section.description && <p className="mt-3 max-w-2xl text-slate-500">{section.description}</p>}
      </div>
      {normalizeHomepageSectionType(section.type) === HOMEPAGE_SECTION_TYPES.PRODUCT_GRID && (
        <ActionButton
          href={section.content?.buttonLink || `/products?section=${section.slug}`}
          label={section.content?.buttonText || 'View All'}
          className="hidden bg-slate-100 text-slate-900 hover:bg-slate-200 sm:inline-flex"
        />
      )}
    </div>
  );
};

const ProductGridSection = ({ section, index, isVisible, toneStyles }) => (
  <section className={`relative overflow-hidden py-16 lg:py-24 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
    <div className="container mx-auto px-4 lg:px-8">
      <SectionHeader section={section} toneStyles={toneStyles} index={index} isVisible={isVisible} />
      {section.products?.length > 0 ? (
        <ProductsCardAll products={section.products} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No products assigned to this section yet.
        </div>
      )}
      <div className="mt-8 text-center sm:hidden">
        <ActionButton
          href={section.content?.buttonLink || `/products?section=${section.slug}`}
          label={section.content?.buttonText || `View ${section.name}`}
          className="bg-slate-100 text-slate-900 hover:bg-slate-200"
        />
      </div>
    </div>
  </section>
);

const PromoSection = ({ section, isVisible, toneStyles, storeName, storeDescription }) => {
  const imageUrl = resolveMediaUrl(section.content?.imageUrl || '');
  const hasImage = Boolean(imageUrl);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`relative overflow-hidden rounded-[32px] p-12 lg:p-16 transition-all duration-700 ${toneStyles.section} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {hasImage && <div className="absolute inset-0 bg-contain bg-center opacity-15" style={{ backgroundImage: `url(${imageUrl})` }} />}
          <div className={`relative grid gap-10 ${hasImage ? 'lg:grid-cols-[1.05fr_0.95fr] lg:items-center' : ''}`}>
            <div className="text-white">
              {section.content?.badge && (
                <span className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium">
                  {section.content.badge}
                </span>
              )}
              <h2 className="text-3xl font-bold lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                {section.name || `Discover What's New at ${storeName}`}
              </h2>
              <p className="mt-4 text-lg text-white/65">
                {section.description || storeDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ActionButton href={section.content?.buttonLink || '/products'} label={section.content?.buttonText || 'Start shopping'} className={toneStyles.primary} />
                <ActionButton href={section.content?.secondaryButtonLink || '/about'} label={section.content?.secondaryButtonText || 'Learn more'} className={toneStyles.secondary} />
              </div>
            </div>

            {hasImage && (
              <div className="flex items-center justify-center">
                <div className="w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/10 p-4">
                  <img
                    src={imageUrl}
                    alt={section.name || 'Section image'}
                    className="h-full w-full max-h-[360px] object-contain sm:max-h-[420px] lg:max-h-[520px]"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const MediaGridSection = ({ section, isVisible, toneStyles }) => {
  const mediaItems = (section.content?.items || []).filter((item) => item?.imageUrl);
  const totalItems = mediaItems.length;
  const sliderRef = useRef(null);

  const scrollByPage = (direction) => {
    if (!sliderRef.current) return;
    const { clientWidth } = sliderRef.current;
    sliderRef.current.scrollBy({ left: clientWidth * direction, behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader section={section} toneStyles={toneStyles} isVisible={isVisible} />
        {totalItems > 0 ? (
          <div className="relative">
            <div
              ref={sliderRef}
              className={`flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              {mediaItems.map((item, itemIndex) => (
                <div key={item.id || itemIndex} className="snap-start shrink-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">


                  <div className={`w-100%  mx-auto rounded-2xl overflow-hidden border-4 ${toneStyles.section} shadow-xl`}>
                    <img src={resolveMediaUrl(item.imageUrl)} alt={section.name || 'Media item'} className="w-full h-full object-fit" />
                  </div>
                  
                </div>
              ))}
            </div>
            {totalItems > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollByPage(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-3 text-slate-700 shadow-lg transition hover:bg-white"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByPage(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-3 text-slate-700 shadow-lg transition hover:bg-white"
                  aria-label="Next media"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No media uploaded yet.
          </div>
        )}
      </div>
    </section>
  );
};

const TestimonialsSection = ({ section, isVisible, toneStyles, fallbackTestimonials = [] }) => {
  const testimonials = section.content?.items?.length ? section.content.items : fallbackTestimonials;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader section={section} toneStyles={toneStyles} isVisible={isVisible} />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item, itemIndex) => (
            <div key={item.id || itemIndex} className={`rounded-[28px] border border-slate-100 bg-slate-50 p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${itemIndex * 100}ms` }}>
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className={`h-4 w-4 ${starIndex < (Number(item.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="mb-6 text-sm italic leading-relaxed text-slate-600">"{item.quote || item.comment || 'Customer review'}"</p>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${toneStyles.accent}`}>
                  {(item.author || item.user || 'C').trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{item.author || item.user || 'Customer'}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {item.role || 'Verified buyer'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="md:col-span-3 rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No testimonials available yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const MarqueeSection = ({ section, isVisible, fallbackItems = [] }) => {
  const marqueeItems = section.content?.items?.length
    ? section.content.items.map((item) => item.label).filter(Boolean)
    : fallbackItems;

  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <div className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {section.content?.badge || section.name}
          </p>
        </div>
        <div className="marquee-container">
          <div className="marquee-content">
            <div className="flex items-center gap-16 px-8">
              {marqueeItems.map((item) => (
                <span key={item} className="whitespace-nowrap text-xl font-bold text-slate-200 transition-colors duration-300 hover:text-violet-400" style={{ fontFamily: 'var(--font-display)' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CtaSection = ({ section, isVisible, toneStyles, storeName, storeDescription }) => (
  <section className="relative overflow-hidden bg-white py-20 lg:py-28">
    <div className="absolute inset-0 dot-pattern opacity-30" />
    <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/40 blur-3xl" />
    <div className={`container mx-auto px-4 lg:px-8 text-center relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {section.content?.badge && (
        <span className={`mb-6 inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${toneStyles.soft}`}>
          {section.content.badge}
        </span>
      )}
      <h2 className="text-3xl font-bold text-slate-900 lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
        {section.name || `Ready to Explore ${storeName}?`}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
        {section.description || storeDescription}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ActionButton href={section.content?.buttonLink || '/products'} label={section.content?.buttonText || `Shop ${storeName}`} className={toneStyles.primary} />
        <ActionButton href={section.content?.secondaryButtonLink || '/about'} label={section.content?.secondaryButtonText || 'Learn more'} className="bg-slate-100 text-slate-800 hover:bg-slate-200" />
      </div>
    </div>
  </section>
);

const ManagedHomepageSection = ({
  section,
  index,
  isVisible,
  fallbackTestimonials,
  fallbackMarqueeItems,
  storeName,
  storeDescription,
}) => {
  const type = normalizeHomepageSectionType(section.type);
  const toneStyles = TONE_STYLES[section.content?.tone] || TONE_STYLES.slate;

  if (type === HOMEPAGE_SECTION_TYPES.PRODUCT_GRID) {
    return <ProductGridSection section={section} index={index} isVisible={isVisible} toneStyles={toneStyles} />;
  }

  if (type === HOMEPAGE_SECTION_TYPES.PROMO) {
    return <PromoSection section={section} isVisible={isVisible} toneStyles={toneStyles} storeName={storeName} storeDescription={storeDescription} />;
  }

  if (type === HOMEPAGE_SECTION_TYPES.MEDIA_GRID) {
    return <MediaGridSection section={section} isVisible={isVisible} toneStyles={toneStyles} />;
  }

  if (type === HOMEPAGE_SECTION_TYPES.TESTIMONIALS) {
    return <TestimonialsSection section={section} isVisible={isVisible} toneStyles={toneStyles} fallbackTestimonials={fallbackTestimonials} />;
  }

  if (type === HOMEPAGE_SECTION_TYPES.MARQUEE) {
    return <MarqueeSection section={section} isVisible={isVisible} fallbackItems={fallbackMarqueeItems} />;
  }

  return <CtaSection section={section} isVisible={isVisible} toneStyles={toneStyles} storeName={storeName} storeDescription={storeDescription} />;
};

export default ManagedHomepageSection;
