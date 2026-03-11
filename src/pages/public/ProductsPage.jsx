import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Star, Grid3x3, List, Columns3,
  ChevronDown, X, SlidersHorizontal, ArrowUpDown, Check, Tag, Package
} from 'lucide-react';
import { productAPI } from '../../services/api';
import ProductsCardAll from '../../components/products/ProductsCardAll';
import { normalizeProduct } from '../../hooks/useApi';
import { useInitialData } from '../../ssr/initial-data';
import { useStoreSettingsStore } from '../../store';
import { getProductGridPageSize, resolveProductLayout } from '../../utils/themeHelpers';
import { filterAndScoreProducts, getProductFilterOptions, sortProducts } from '../../utils/productSearch';
import { formatCurrency } from '../../utils';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-sm font-semibold text-slate-900"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductsPage = () => {
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'products' ? initialData.routeData : null;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const theme = useStoreSettingsStore((state) => state.theme);
  const [viewMode, setViewMode] = useState(() => resolveProductLayout(theme?.layoutType));
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || (initialQuery ? 'relevance' : 'newest'));
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState(searchParams.get('category')?.split(',') || []);
  const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brand')?.split(',') || []);
  const [selectedTags, setSelectedTags] = useState(searchParams.get('tag')?.split(',') || []);
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 5000,
  });
  const [selectedRating, setSelectedRating] = useState(Number(searchParams.get('rating')) || 0);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('onSale') === 'true');
  const [sectionFilter, setSectionFilter] = useState(searchParams.get('section') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  const productsPerPage = useMemo(
    () => getProductGridPageSize(theme, viewMode),
    [theme, viewMode]
  );
  
  // Use same pattern as AdminProductManagement
  const [products, setProducts] = useState(() => initialRouteData?.products || []);
  const [isLoading, setIsLoading] = useState(() => !initialRouteData);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (initialRouteData) {
      return;
    }

    loadData();
  }, [initialRouteData]);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategories(searchParams.get('category')?.split(',') || []);
    setSelectedBrands(searchParams.get('brand')?.split(',') || []);
    setSelectedTags(searchParams.get('tag')?.split(',') || []);
    setSelectedRating(Number(searchParams.get('rating')) || 0);
    setInStockOnly(searchParams.get('inStock') === 'true');
    setOnSaleOnly(searchParams.get('onSale') === 'true');
    setSectionFilter(searchParams.get('section') || '');
    const urlSort = searchParams.get('sort');
    setSortBy(urlSort || (searchParams.get('q') ? 'relevance' : 'newest'));
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    setViewMode(resolveProductLayout(theme?.layoutType));
  }, [theme?.layoutType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [productsPerPage]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      
      // Load products - same logic as AdminProductManagement
      const productsResponse = await productAPI.getProducts({ limit: '48' });
      const productItems = productsResponse.data?.data?.items || [];
      setProducts(productItems.map(normalizeProduct));
      
    } catch (error) {
      console.warn('Failed to load products from API:', error);
      setProducts([]);
      setLoadError(error?.response?.data?.message || error?.message || 'Failed to load products from server');
    } finally {
      setIsLoading(false);
    }
  };

  const ALL_PRODUCTS = products;
  const filterOptions = useMemo(() => getProductFilterOptions(ALL_PRODUCTS), [ALL_PRODUCTS]);
  const categoryOptions = filterOptions.categories;
  const brandOptions = filterOptions.brands;
  const tagOptions = filterOptions.tags;
  const maxProductPrice = filterOptions.maxPrice || 5000;

  useEffect(() => {
    setPriceRange((current) => ({
      min: Math.max(0, current.min),
      max: current.max ? Math.min(current.max, maxProductPrice || current.max) : maxProductPrice,
    }));
  }, [maxProductPrice]);

  const filteredProducts = useMemo(() => {
    return filterAndScoreProducts(ALL_PRODUCTS, query, {
      categories: selectedCategories,
      brands: selectedBrands,
      tags: selectedTags,
      priceRange,
      rating: selectedRating,
      inStock: inStockOnly,
      onSale: onSaleOnly,
      section: sectionFilter,
    });
  }, [ALL_PRODUCTS, query, selectedCategories, selectedBrands, selectedTags, priceRange, selectedRating, inStockOnly, onSaleOnly, sectionFilter]);

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sortBy),
    [filteredProducts, sortBy]
  );

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedTags([]);
    setPriceRange({ min: 0, max: maxProductPrice });
    setSelectedRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const activeFilterCount = selectedCategories.length + selectedBrands.length +
    (priceRange.min > 0 || priceRange.max < maxProductPrice ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0) + selectedTags.length +
    (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (selectedBrands.length) params.set('brand', selectedBrands.join(','));
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < maxProductPrice) params.set('maxPrice', priceRange.max.toString());
    if (selectedRating > 0) params.set('rating', selectedRating.toString());
    if (selectedTags.length) params.set('tag', selectedTags.join(','));
    if (inStockOnly) params.set('inStock', 'true');
    if (onSaleOnly) params.set('onSale', 'true');
    if (sectionFilter) params.set('section', sectionFilter);
    setSearchParams(params);
  }, [query, sortBy, selectedCategories, selectedBrands, priceRange, selectedRating, selectedTags, inStockOnly, onSaleOnly, sectionFilter, maxProductPrice, setSearchParams]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategories, selectedBrands, selectedTags, priceRange, selectedRating, inStockOnly, onSaleOnly, sortBy]);

  const toggleFilter = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 py-10 lg:py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            All Products
          </h1>
          <p className="text-violet-200">
            Discover our complete collection of {sortedProducts.length}+ products
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full pl-12 pr-12 py-3.5 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className={`
            ${showFilters ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent lg:z-auto' : 'hidden lg:block'}
            lg:w-64 lg:shrink-0
          `}>
            <div className={`
              ${showFilters ? 'absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto lg:relative lg:w-auto lg:shadow-none lg:p-0' : ''}
            `}>
              {/* Mobile filter header */}
              {showFilters && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-violet-600 hover:underline">
                      Clear All
                    </button>
                  )}
                </div>

                {/* Categories */}
                <FilterSection title="Categories">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categoryOptions.map(category => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          selectedCategories.includes(category)
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-slate-300 group-hover:border-violet-400'
                        }`}>
                          {selectedCategories.includes(category) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{category}</span>
                        <span className="ml-auto text-xs text-slate-400">
                          {ALL_PRODUCTS.filter(p => (p.category || p.categorySlug) === category).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        placeholder="Min"
                        className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        placeholder="Max"
                        className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxProductPrice}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full accent-violet-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{formatCurrency(0)}</span>
                      <span>{formatCurrency(maxProductPrice)}</span>
                    </div>
                  </div>
                </FilterSection>

                {/* Rating */}
                <FilterSection title="Minimum Rating">
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          selectedRating === rating
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-slate-300 group-hover:border-violet-400'
                        }`}>
                          {selectedRating === rating && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="rating"
                          className="hidden"
                          checked={selectedRating === rating}
                          onChange={() => setSelectedRating(rating)}
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-sm text-slate-600 ml-1">& Up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Brands */}
                <FilterSection title="Brands">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brandOptions.map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          selectedBrands.includes(brand)
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-slate-300 group-hover:border-violet-400'
                        }`}>
                          {selectedBrands.includes(brand) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{brand}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Tags */}
                <FilterSection title="Tags" defaultOpen={false}>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.slice(0, 20).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleFilter(tag, selectedTags, setSelectedTags)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Additional Filters */}
                <FilterSection title="More Filters" defaultOpen={false}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        inStockOnly ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                      }`}>
                        {inStockOnly && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                      />
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">In Stock Only</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        onSaleOnly ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                      }`}>
                        {onSaleOnly && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={onSaleOnly}
                        onChange={(e) => setOnSaleOnly(e.target.checked)}
                      />
                      <Tag className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">On Sale</span>
                    </label>
                  </div>
                </FilterSection>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="h-5 w-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{filteredProducts.length}</span> products found
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('masonry')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'masonry' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Columns3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-slate-500">Active:</span>
                {selectedCategories.map((category) => (
                  <span key={category} className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-sm">
                    {category}
                    <button onClick={() => setSelectedCategories((current) => current.filter((item) => item !== category))} className="hover:text-violet-900">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {selectedBrands.map((brand) => (
                  <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">
                    {brand}
                    <button onClick={() => setSelectedBrands((current) => current.filter((item) => item !== brand))} className="hover:text-slate-900">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {selectedRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm">
                    {selectedRating}+ Stars
                    <button onClick={() => setSelectedRating(0)} className="hover:text-amber-900">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                    In Stock
                    <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-900">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
                {onSaleOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-sm">
                    On Sale
                    <button onClick={() => setOnSaleOnly(false)} className="hover:text-rose-900">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid / List */}
            {loadError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {loadError}
              </div>
            )}
            {isLoading && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                Loading products...
              </div>
            )}

            {/* {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover-card">
                    <div className="relative aspect-square product-image-zoom bg-slate-50">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      {product.comparePrice && (
                        <span className="absolute top-3 left-3 badge bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg">
                          {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                        </span>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <button className="h-9 w-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-500 shadow-lg transition-all">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Link to={`/products/${product.slug}`} className="block w-full py-2.5 bg-slate-900/90 text-white text-sm font-medium text-center rounded-xl hover:bg-slate-900 transition-colors">
                          View Product
                        </Link>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">({product.reviewCount})</span>
                      </div>
                      <Link to={`/products/${product.slug}`}>
                        <h3 className="font-medium text-sm text-slate-800 mb-1 line-clamp-2 group-hover:text-violet-700 transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-slate-400 mb-3">{product.brand}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-900">{formatCurrency(product.price)}</span>
                        {product.comparePrice && <span className="text-sm text-slate-400 line-through">{formatCurrency(product.comparePrice)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="group flex bg-white rounded-2xl border border-slate-100 overflow-hidden hover-card">
                    <div className="relative w-48 h-48 shrink-0 product-image-zoom bg-slate-50">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      {product.comparePrice && (
                        <span className="absolute top-3 left-3 badge bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs">
                          {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">({product.reviewCount})</span>
                        </div>
                        <Link to={`/products/${product.slug}`}>
                          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-violet-700 transition-colors">{product.name}</h3>
                        </Link>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{product.shortDescription}</p>
                        <p className="text-xs text-slate-400">{product.brand} • {product.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl text-slate-900">{formatCurrency(product.price)}</span>
                          {product.comparePrice && <span className="text-sm text-slate-400 line-through">{formatCurrency(product.comparePrice)}</span>}
                        </div>
                        <Link to={`/products/${product.slug}`}>
                          <button className="px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" /> View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} */}

            <ProductsCardAll products={paginatedProducts} viewMode={viewMode} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-10 w-10 text-sm font-medium rounded-xl transition-all ${currentPage === i + 1
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
