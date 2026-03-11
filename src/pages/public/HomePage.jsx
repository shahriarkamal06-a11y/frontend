import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Truck, Shield,
  Headphones, ChevronLeft, ChevronRight, Sparkles,
  Award, Package
} from 'lucide-react';
import { formatCurrency } from '../../utils';
import { productAPI, categoryAPI, reviewAPI, sectionAPI } from '../../services/api';
import { AnnouncementBannerRegion } from '../../components/announcement';
import { normalizeProduct, normalizeCategory } from '../../hooks/useApi';
import { getIconComponent } from '../../utils/iconUtils';
import { useStoreSettingsStore } from '../../store';
import { normalizeHomepageHeroSlide } from '../../utils/storeSettings';
import { useInitialData } from '../../ssr/initial-data';
import { getProductGridPageSize } from '../../utils/themeHelpers';
import ManagedHomepageSection from '../../components/homepage/ManagedHomepageSection';
import { HOMEPAGE_SECTION_TYPES, normalizeHomepageSection } from '../../utils/homepageSections';
import { buildCategoryTree } from '../../utils/categoryTree';

const renderCategoryIcon = (rawIcon) => {
  const iconText = typeof rawIcon === 'string' ? rawIcon.trim() : '';
  if (iconText && Array.from(iconText).length <= 2) {
    return <span>{iconText}</span>;
  }

  const IconComponent = getIconComponent(iconText, 'Package');
  return <IconComponent className="h-5 w-5 text-white" />;
};

// Intersection Observer Hook for scroll animations
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};
const SectionRendererToDelete = () => {
  return null;
  const sectionFallbackIcon = SECTION_ICON_FALLBACK[section.slug] || 'Package';
  const isFlashSale = section.slug === 'flash-sale';
  
  const getBgClass = (index) => {
    return index % 2 === 0 ? 'bg-white' : 'bg-slate-50';
  };
  
  const getAccentColor = (slug) => {
    switch (slug) {
      case 'featured': return 'violet';
      case 'flash-sale': return 'amber';
      case 'new-arrivals': return 'emerald';
      case 'best-sellers': return 'rose';
      case 'trending': return 'blue';
      default: return 'slate';
    }
  };
  
  const accent = getAccentColor(section.slug);
  const accentStyles = ACCENT_STYLE_MAP[accent] || ACCENT_STYLE_MAP.slate;
  
  return (
    <section className={`py-16 lg:py-24 ${getBgClass(index)} relative overflow-hidden`}>
      {isFlashSale && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </>
      )}
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accentStyles.iconContainer}`}>
                {renderSectionIcon(section.icon, sectionFallbackIcon)}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                {section.name}
              </h2>
            </div>
            {section.description && (
              <p className="text-slate-500">{section.description}</p>
            )}
          </div>
          
          {isFlashSale && (
            <div className="text-sm text-amber-600 font-medium">
              ⚡ Limited Time Offer
            </div>
          )}
          
          {!isFlashSale && (
            <Link to={`/products?section=${section.slug}`} className="hidden sm:flex">
              <button className={`group px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2 hover:gap-3 ${accentStyles.button}`}>
                View All
                <ArrowRight className="h-4 w-4 transition-transform" />
              </button>
            </Link>
          )}
        </div>
        
        {section.products.length > 0 ? (
          <ProductsCardAll
            products={section.products}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No products added to this section yet.</p>
          </div>
        )}
        
        {!isFlashSale && (
          <div className="text-center mt-8 sm:hidden">
            <Link to={`/products?section=${section.slug}`}>
              <button className={`px-6 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2 mx-auto ${accentStyles.button}`}>
                View All {section.name}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

const SectionBlock = ({ section, index, testimonials, marqueeItems, storeName, storeDescription }) => {
  const [sectionRef, sectionVisible] = useInView();
  return (
    <div ref={sectionRef}>
      <ManagedHomepageSection
        section={section}
        index={index}
        isVisible={sectionVisible}
        fallbackTestimonials={testimonials}
        fallbackMarqueeItems={marqueeItems}
        storeName={storeName}
        storeDescription={storeDescription}
      />
    </div>
  );
};

// Hero slides are now loaded from store settings.

const createFallbackHeroSlide = (storeName, storeDescription) => normalizeHomepageHeroSlide({
  id: 'default-store-slide',
  badge: storeName ? `Welcome to ${storeName}` : 'Welcome',
  title: storeName || 'Discover our latest products',
  subtitle: storeDescription || 'Browse our current collection and shop with confidence.',
  cta: 'Shop Now',
  ctaLink: '/products',
  image: '',
  gradient: 'from-slate-950 via-violet-950 to-slate-900',
});

const SectionLoadingSkeleton = () => (
  <section className="py-16 lg:py-24 bg-white">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-56 rounded-xl bg-slate-200 mb-4" />
        <div className="h-4 w-80 rounded-xl bg-slate-100 mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="aspect-square rounded-2xl bg-slate-200 mb-4" />
              <div className="h-4 w-3/4 rounded bg-slate-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const HomePage = () => {
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'home' ? initialData.routeData : null;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideTimerRef = useRef(null);
  const isPausedRef = useRef(false);

  // Use same pattern as AdminProductManagement
  const [products, setProducts] = useState(() => initialRouteData?.products || []);
  const [categories, setCategories] = useState(() => initialRouteData?.categories || []);
  const [sections, setSections] = useState(() => (initialRouteData?.sections || []).map(normalizeHomepageSection));
  const [testimonials, setTestimonials] = useState(() => initialRouteData?.testimonials || []);
  const [isLoading, setIsLoading] = useState(() => !initialRouteData);
  const store = useStoreSettingsStore((state) => state.store);
  const theme = useStoreSettingsStore((state) => state.theme);
  const storeName = store.name || 'Our Store';
  const storeDescription = store.description || 'Explore curated products, secure checkout, and fast delivery.';
  const freeShippingThreshold = store.shippingConfig?.freeShippingThreshold ?? 100;
  const sectionProductLimit = useMemo(
    () => Math.max(8, getProductGridPageSize(theme, 'grid')),
    [theme]
  );
  const heroSlides = useMemo(() => {
    const configuredSlides = Array.isArray(store.homepage?.heroSlides)
      ? store.homepage.heroSlides
        .map((slide, index) => normalizeHomepageHeroSlide(slide, index))
        .filter((slide) => slide.title)
      : [];

    if (configuredSlides.length > 0) {
      return configuredSlides;
    }

    return [createFallbackHeroSlide(storeName, storeDescription)];
  }, [store.homepage?.heroSlides, storeDescription, storeName]);

  useEffect(() => {
    if (initialRouteData) {
      return;
    }

    loadData();
  }, [initialRouteData, sectionProductLimit]);

  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, heroSlides.length]);

  const loadData = async () => {
    setIsLoading(true);

    const [productsResult, categoriesResult, sectionsResult, reviewsResult] = await Promise.allSettled([
      productAPI.getProducts({ limit: String(Math.max(24, sectionProductLimit)) }),
      categoryAPI.getCategories({ limit: 500, page: 1 }),
      sectionAPI.getSections({ activeOnly: true }),
      reviewAPI.getReviews({ limit: '3', page: '1' }),
    ]);

    if (productsResult.status === 'fulfilled') {
      const productItems = productsResult.value.data?.data?.items || [];
      setProducts(productItems.map(normalizeProduct));
    } else {
      console.warn('Failed to load homepage products:', productsResult.reason);
      setProducts([]);
    }

    if (categoriesResult.status === 'fulfilled') {
      const categoryItems = categoriesResult.value.data?.data?.items || [];
      setCategories(categoryItems.map(normalizeCategory));
    } else {
      console.warn('Failed to load homepage categories:', categoriesResult.reason);
      setCategories([]);
    }

    if (sectionsResult.status === 'fulfilled') {
      const sectionItems = sectionsResult.value.data?.data?.items || [];
      setSections(sectionItems.map(normalizeHomepageSection));
    } else {
      console.warn('Failed to load sections:', sectionsResult.reason);
      setSections([]);
    }

    if (reviewsResult.status === 'fulfilled') {
      const reviewItems = reviewsResult.value.data?.data?.items || [];
      setTestimonials(reviewItems.map((review) => ({
        id: review.id,
        rating: Number(review.rating) || 0,
        comment: review.comment || review.title || 'Customer review',
        user: review.userName || 'Customer',
        avatar: (review.userName || 'C').trim().charAt(0).toUpperCase(),
      })));
    } else {
      console.warn('Failed to load homepage reviews:', reviewsResult.reason);
      setTestimonials([]);
    }

    setIsLoading(false);
  };

  const allProducts = products;
  const allCategories = categories;
  const categoryTree = useMemo(() => buildCategoryTree(allCategories), [allCategories]);
  const featuredCategories = useMemo(() => {
    const roots = categoryTree.length > 0 ? categoryTree : allCategories;
    return roots.slice(0, 6);
  }, [allCategories, categoryTree]);

  // Create section-based product filtering with backend section control
  const getSectionProducts = (sectionSlug, fallbackFilter) => {
    const section = sections.find(s => s.slug === sectionSlug);
    
    if (!section || !section.isActive) {
      return [];
    }
    
    const sectionProducts = allProducts.filter(p => p.section === sectionSlug);
    
    if (sectionProducts.length > 0) return sectionProducts.slice(0, sectionProductLimit);
    
    // Fallback logic if no products assigned to section
    const fallbackProducts = fallbackFilter ? fallbackFilter() : [];
    return fallbackProducts.slice(0, sectionProductLimit);
  };

  // Get all active sections with their products
  const activeSections = useMemo(() => (
    sections
      .filter((section) => section.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((section) => {
        if (section.type !== HOMEPAGE_SECTION_TYPES.PRODUCT_GRID) {
          return section;
        }

        let products = [];

        switch (section.slug) {
          case 'featured':
            products = getSectionProducts('featured');
            break;
          case 'flash-sale':
            products = getSectionProducts('flash-sale', () => allProducts.filter((product) => product.isFlashSale).slice(0, 8));
            break;
          case 'new-arrivals':
            products = getSectionProducts('new-arrivals', () => allProducts.slice(0, 8));
            break;
          case 'best-sellers':
            products = getSectionProducts('best-sellers', () => allProducts.filter((product) => product.reviewCount > 500).slice(0, 8));
            break;
          case 'trending':
            products = getSectionProducts('trending', () => allProducts.slice(8, 16));
            break;
          default:
            products = getSectionProducts(section.slug);
        }

        return {
          ...section,
          products,
        };
      })
  ), [allProducts, sectionProductLimit, sections]);

  const heroStats = useMemo(() => {
    const averageRating = testimonials.length > 0
      ? (testimonials.reduce((total, review) => total + review.rating, 0) / testimonials.length).toFixed(1)
      : null;

    return [
      { value: `${allProducts.length}`, label: allProducts.length === 1 ? 'Product' : 'Products' },
      { value: `${allCategories.length}`, label: allCategories.length === 1 ? 'Category' : 'Categories' },
      averageRating
        ? { value: averageRating, label: 'Review Score' }
        : { value: `${activeSections.length}`, label: activeSections.length === 1 ? 'Section' : 'Sections' },
    ];
  }, [activeSections.length, allCategories.length, allProducts.length, testimonials]);

  const marqueeItems = useMemo(() => {
    const items = [...new Set([
      ...allCategories.map((category) => category.name).filter(Boolean),
      ...activeSections
        .filter((section) => section.type === HOMEPAGE_SECTION_TYPES.PRODUCT_GRID)
        .map((section) => section.name)
        .filter(Boolean),
    ])];

    return items.length > 0 ? items : [storeName];
  }, [activeSections, allCategories, storeName]);

  // Section refs for scroll animations
  const [trustRef, trustVisible] = useInView();
  const [catRef, catVisible] = useInView();

  // Clear slide timer
  const clearSlideTimer = useCallback(() => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
    }
  }, []);

  // Go to specific slide
  const goToSlide = useCallback((index, direction = 'right') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSlideDirection(direction);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 900);
  }, [isTransitioning]);

  // Auto-slide hero with pause on hover
  const startSlideTimer = useCallback(() => {
    clearSlideTimer();
    if (heroSlides.length <= 1) {
      return;
    }
    slideTimerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % heroSlides.length;
          setSlideDirection('right');
          setIsTransitioning(true);
          setTimeout(() => setIsTransitioning(false), 900);
          return next;
        });
      }
    }, 6000);
  }, [clearSlideTimer, heroSlides.length]);

  useEffect(() => {
    startSlideTimer();
    return () => {
      clearSlideTimer();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [startSlideTimer, clearSlideTimer]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length <= 1) {
      return;
    }
    clearSlideTimer();
    const next = (currentSlide + 1) % heroSlides.length;
    goToSlide(next, 'right');
    startSlideTimer();
  }, [currentSlide, goToSlide, clearSlideTimer, heroSlides.length, startSlideTimer]);

  const prevSlide = useCallback(() => {
    if (heroSlides.length <= 1) {
      return;
    }
    clearSlideTimer();
    const prev = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    goToSlide(prev, 'left');
    startSlideTimer();
  }, [currentSlide, goToSlide, clearSlideTimer, heroSlides.length, startSlideTimer]);

  const handleIndicatorClick = useCallback((index) => {
    if (heroSlides.length <= 1) {
      return;
    }
    clearSlideTimer();
    const direction = index > currentSlide ? 'right' : 'left';
    goToSlide(index, direction);
    startSlideTimer();
  }, [currentSlide, goToSlide, clearSlideTimer, heroSlides.length, startSlideTimer]);

  const [isPaused, setIsPaused] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    clearSlideTimer();
    // Resume after 6 seconds even if still hovering
    hoverTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
      setIsPaused(false);
      startSlideTimer();
    }, 6000);
  }, [clearSlideTimer, startSlideTimer]);

  const handleMouseLeave = useCallback(() => {
    // Clear the hover timeout if mouse leaves before 6 seconds
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    isPausedRef.current = false;
    setIsPaused(false);
    startSlideTimer();
  }, [startSlideTimer]);


  return (
    <div className="overflow-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative h-[620px] lg:h-[720px] overflow-hidden bg-slate-950"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hero Particles */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="hero-particle"
              style={{
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
                width: `${6 + i * 3}px`,
                height: `${6 + i * 3}px`,
                background: `rgba(139, 92, 246, ${0.3 - i * 0.04})`,
              }}
            />
          ))}
        </div>

        {/* Optimized: Only render current slide for better performance */}
        {heroSlides.map((slide, i) => {
          // Only render if it's the current slide (prevents DOM bloat with 18 slides)
          if (i !== currentSlide) return null;
          return (
          <div
            key={i}
            className="absolute inset-0 hero-slide hero-slide-active z-[2] p-0 lg:p-15"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: slide.image ? `url(${slide.image})` : 'none' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
              }} />
            </div>

            {i === currentSlide && (
              <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center z-10">
                <div className="max-w-2xl">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-sm text-white/80 mb-6 hero-content-enter"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>{slide.badge || `Welcome to ${storeName}`}</span>
                  </div>
                  <h1
                    className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] whitespace-pre-line hero-content-enter"
                    style={{ fontFamily: 'var(--font-display)', animationDelay: '0.2s' }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className="text-lg text-white/60 mb-8 max-w-lg hero-content-enter"
                    style={{ animationDelay: '0.35s' }}
                  >
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4 hero-content-enter" style={{ animationDelay: '0.45s' }}>
                    <Link to={slide.ctaLink}>
                      <button className="group px-8 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-100 transition-all duration-300 shadow-2xl shadow-black/20 flex items-center gap-2 text-sm hover:gap-3 ripple-effect">
                        {slide.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </Link>
                    <Link to="/products">
                      <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2 text-sm">
                        Browse Categories
                      </button>
                    </Link>
                  </div>

                  {/* Stats strip */}
                  <div className="flex items-center gap-8 mt-10 hero-content-enter" style={{ animationDelay: '0.55s' }}>
                    {heroStats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-white/40">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })}

        {/* Slide Progress - pauses on hover */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/10">
            <div
              key={currentSlide}
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              style={{
                animation: 'slideProgress 6s linear forwards',
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            />
          </div>
        )}

        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleIndicatorClick(i)}
                className={`h-2.5 rounded-full transition-all duration-500 ${i === currentSlide
                    ? 'w-10 bg-white shadow-lg shadow-white/30'
                    : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Navigation arrows */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 bg-transparent rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 border border-white/10 hidden lg:flex z-20 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 border border-white/10 hidden lg:flex z-20 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </section>

      {/* ==================== TRUST BADGES ==================== */}
      <section ref={trustRef} className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
            {[
              { icon: Truck, title: 'Free Shipping', desc: `On orders over ${formatCurrency(freeShippingThreshold, store.currency || 'USD')}`, color: 'text-emerald-600 bg-emerald-50' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-blue-600 bg-blue-50' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated help', color: 'text-violet-600 bg-violet-50' },
              { icon: Package, title: 'Easy Returns', desc: '30-day guarantee', color: 'text-amber-600 bg-amber-50' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-6 px-4 lg:px-6 justify-center group cursor-default transition-all duration-500 hover:bg-slate-50/50 ${trustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`h-11 w-11 rounded-xl ${item.color.split(' ')[1]} flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  <item.icon className={`h-5 w-5 ${item.color.split(' ')[0]}`} />
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-sm text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section ref={catRef} className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${catVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-medium mb-4">
              <Award className="h-4 w-4" /> Popular Categories
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Shop by Category
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Discover our curated collections across different categories
            </p>
          </div>

          {isLoading && allCategories.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
              {featuredCategories.map((category, i) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className={`group relative rounded-2xl overflow-hidden border border-slate-100 bg-white category-image-zoom transition-all duration-500 hover-card ${catVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-square overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="300"
                        height="300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-white to-slate-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent transition-all duration-500 group-hover:from-violet-900/80 group-hover:via-violet-900/20" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <div className="text-2xl mb-1">{renderCategoryIcon(category.icon)}</div>
                    <h3 className="font-semibold text-white text-sm">{category.name}</h3>
                    <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== DYNAMIC SECTIONS ==================== */}
      {isLoading && activeSections.length === 0 && <SectionLoadingSkeleton />}
      {activeSections.map((section, index) => (
        <div key={section.id || section.slug}>
          <div className="container mx-auto px-4 lg:px-8 pt-6">
            <AnnouncementBannerRegion surfaces={['SECTION']} sectionIds={[section.id, section.slug].filter(Boolean)} compact />
          </div>
          <SectionBlock
            section={section}
            index={index}
            testimonials={testimonials}
            marqueeItems={marqueeItems}
            storeName={storeName}
            storeDescription={storeDescription}
          />
        </div>
      ))}
    </div>
  );
};

export default HomePage;
