import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  Star,
  Heart,
  ShoppingCart,
  X,
  SlidersHorizontal,
  ChevronDown,
  Filter,
  Grid3X3,
  List,
  Columns3,
  ArrowUpDown,
  Check,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '../../utils';
import { useProducts } from '../../hooks/useApi';
import ProductsCardAll from '../../components/products/ProductsCardAll';
import { useInitialData } from '../../ssr/initial-data';
import { useStoreSettingsStore } from '../../store';
import { getProductGridPageSize, resolveProductLayout } from '../../utils/themeHelpers';
import { filterAndScoreProducts, getProductFilterOptions, sortProducts } from '../../utils/productSearch';

// FilterSection component defined outside SearchPage to prevent remounting on filter changes
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
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchPage = () => {
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'search' ? initialData.routeData : null;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const theme = useStoreSettingsStore((state) => state.theme);

  // Fetch from API with fallback - limit to 48 products for performance
  const { products: apiProducts } = useProducts({ limit: '48' });
  const ALL_PRODUCTS = initialRouteData?.products?.length ? initialRouteData.products : apiProducts;
  const [viewMode, setViewMode] = useState(() => resolveProductLayout(theme?.layoutType));
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultItemsPerPage = useMemo(
    () => getProductGridPageSize(theme, viewMode),
    [theme, viewMode]
  );
  const [itemsPerPage, setItemsPerPage] = useState(() => defaultItemsPerPage);
  const searchInputRef = useRef(null);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState(searchParams.get('category')?.split(',') || []);
  const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brand')?.split(',') || []);
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 2000
  });
  const [selectedRating, setSelectedRating] = useState(Number(searchParams.get('rating')) || 0);
  const [selectedTags, setSelectedTags] = useState(searchParams.get('tag')?.split(',') || []);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('onSale') === 'true');

  useEffect(() => {
    setViewMode(resolveProductLayout(theme?.layoutType));
  }, [theme?.layoutType]);

  useEffect(() => {
    setItemsPerPage(defaultItemsPerPage);
  }, [defaultItemsPerPage]);

  // Extract unique values for filters
  const filterOptions = useMemo(() => getProductFilterOptions(ALL_PRODUCTS), [ALL_PRODUCTS]);
  const categories = filterOptions.categories;
  const brands = filterOptions.brands;
  const tags = filterOptions.tags;
  const maxProductPrice = filterOptions.maxPrice;

  useEffect(() => {
    setPriceRange((current) => ({
      min: Math.max(0, current.min),
      max: current.max ? Math.min(current.max, maxProductPrice || current.max) : maxProductPrice,
    }));
  }, [maxProductPrice]);

  // Apply all filters
  const filteredResults = useMemo(() => {
    return filterAndScoreProducts(ALL_PRODUCTS, query, {
      categories: selectedCategories,
      brands: selectedBrands,
      tags: selectedTags,
      priceRange,
      rating: selectedRating,
      inStock: inStockOnly,
      onSale: onSaleOnly,
    });
  }, [ALL_PRODUCTS, query, selectedCategories, selectedBrands, selectedTags, priceRange, selectedRating, inStockOnly, onSaleOnly]);

  // Sort results
  const sortedResults = useMemo(
    () => sortProducts(filteredResults, sortBy),
    [filteredResults, sortBy]
  );

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedResults.slice(start, start + itemsPerPage);
  }, [sortedResults, currentPage, itemsPerPage]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (selectedBrands.length) params.set('brand', selectedBrands.join(','));
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < maxProductPrice) params.set('maxPrice', priceRange.max.toString());
    if (selectedRating > 0) params.set('rating', selectedRating.toString());
    if (selectedTags.length) params.set('tag', selectedTags.join(','));
    if (inStockOnly) params.set('inStock', 'true');
    if (onSaleOnly) params.set('onSale', 'true');
    setSearchParams(params);
  }, [query, sortBy, selectedCategories, selectedBrands, priceRange, selectedRating, selectedTags, inStockOnly, onSaleOnly, maxProductPrice, setSearchParams]);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategories, selectedBrands, priceRange, selectedRating, selectedTags, inStockOnly, onSaleOnly, sortBy]);

  const suggestions = ['Headphones', 'Laptop', 'Watch', 'Running Shoes', 'Camera', 'Coffee', 'Phone', 'Tablet'];

  const toggleFilter = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: maxProductPrice });
    setSelectedRating(0);
    setSelectedTags([]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('relevance');
  };

  const activeFiltersCount = selectedCategories.length + selectedBrands.length +
    (priceRange.min > 0 || priceRange.max < maxProductPrice ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0) + selectedTags.length +
    (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full pl-12 pr-12 py-4 text-lg bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </form>

            {/* Suggestions */}
            {!query && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-slate-500">Popular:</span>
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setQuery(s)} 
                    className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <p className="text-sm text-slate-500">
              {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''}
              {query && <> for "<span className="text-violet-600 font-medium">{query}</span>"</>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'masonry' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Columns3 className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none cursor-pointer"
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="hidden sm:block px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-slate-500">Active filters:</span>
            {selectedCategories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                {cat}
                <button onClick={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedBrands.map(brand => (
              <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {brand}
                <button onClick={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {(priceRange.min > 0 || priceRange.max < maxProductPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
                <button onClick={() => setPriceRange({ min: 0, max: maxProductPrice })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                {selectedRating}+ Stars
                <button onClick={() => setSelectedRating(0)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-rose-600 hover:text-rose-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Categories */}
              <FilterSection title="Categories">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(category => (
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
                        {ALL_PRODUCTS.filter(p => p.category === category).length}
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
                  {brands.map(brand => (
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
                  {tags.slice(0, 20).map(tag => (
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
          </aside>

          {/* Results */}
          <div className="flex-1">
            {sortedResults.length > 0 ? (
              <>
                <ProductsCardAll
                  products={paginatedResults}
                  viewMode={viewMode}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] h-10 rounded-xl font-medium transition-all ${
                              currentPage === page
                                ? 'bg-violet-600 text-white'
                                : 'border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 || 
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="text-slate-400">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
