import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import ProductsCardAll from '../../components/products/ProductsCardAll';
import { productAPI, categoryAPI } from '../../services/api';
import { normalizeProduct, normalizeCategory } from '../../hooks/useApi';
import { useInitialData } from '../../ssr/initial-data';
import { useStoreSettingsStore } from '../../store';
import { getProductGridPageSize } from '../../utils/themeHelpers';
import { buildCategoryIndex, buildCategoryTree, getCategoryAncestors, getCategoryDescendants } from '../../utils/categoryTree';

const CategoryPage = () => {
  const { slug } = useParams();
  const initialData = useInitialData();
  const initialRouteData = initialData?.routeType === 'category' && initialData?.routeParams?.slug === slug
    ? initialData.routeData
    : null;
  const theme = useStoreSettingsStore((state) => state.theme);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = useMemo(() => getProductGridPageSize(theme, theme?.layoutType), [theme]);
  const [allProducts, setAllProducts] = useState(() => initialRouteData?.products || []);
  const [allCategories, setAllCategories] = useState(() => initialRouteData?.categories || []);
  const [isLoading, setIsLoading] = useState(() => !initialRouteData);

  const categoryIndex = useMemo(() => buildCategoryIndex(allCategories), [allCategories]);
  const categoryTree = useMemo(() => buildCategoryTree(allCategories), [allCategories]);

  useEffect(() => {
    if (initialRouteData) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getProducts({ limit: '200' }),
          categoryAPI.getCategories({ limit: '500', page: 1 }),
        ]);
        const productItems = productsRes?.data?.data?.items || [];
        const categoryItems = categoriesRes?.data?.data?.items || [];
        setAllProducts(productItems.map(normalizeProduct));
        setAllCategories(categoryItems.map(normalizeCategory));
      } catch (error) {
        console.warn('Failed to load category page data:', error);
        setAllProducts([]);
        setAllCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialRouteData]);

  const category = categoryIndex.bySlug.get(slug);
  const categoryAncestors = useMemo(
    () => (category ? getCategoryAncestors(allCategories, category.id) : []),
    [allCategories, category]
  );
  const descendantCategories = useMemo(
    () => (category ? getCategoryDescendants(allCategories, category.id) : []),
    [allCategories, category]
  );
  const descendantSlugs = useMemo(() => {
    if (!category) return new Set();
    return new Set([category.slug, ...descendantCategories.map((item) => item.slug).filter(Boolean)]);
  }, [category, descendantCategories]);

  // Limit products for performance - slice from filtered results
  const allCategoryProducts = useMemo(() => {
    if (!category) return [];
    const filtered = allProducts.filter((product) => descendantSlugs.has(product.categorySlug));
    return filtered.slice(0, 100); // Limit to 100 max for performance
  }, [allProducts, category, descendantSlugs]);

  const breadcrumbTrail = useMemo(
    () => [...categoryAncestors, category].filter(Boolean),
    [categoryAncestors, category]
  );

  const relatedCategories = useMemo(() => {
    if (!category) return [];
    const children = categoryIndex.childrenByParent.get(category.id) || [];
    if (children.length > 0) return children;
    if (category.parentId) {
      return (categoryIndex.childrenByParent.get(category.parentId) || []).filter((item) => item.id !== category.id);
    }
    return categoryTree.filter((item) => item.id !== category.id);
  }, [category, categoryIndex, categoryTree]);

  // Pagination logic
  const totalPages = Math.ceil(allCategoryProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return allCategoryProducts.slice(start, start + productsPerPage);
  }, [allCategoryProducts, currentPage]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [slug, productsPerPage]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Category Not Found</h2>
        <p className="text-slate-500 mb-6">This category doesn't exist.</p>
        <Link to="/products" className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors">Browse All Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200'}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          width="1200"
          height="400"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-8">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/60 mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              {breadcrumbTrail.map((crumb, index) => (
                <span key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {index === breadcrumbTrail.length - 1 ? (
                    <span className="text-white">{crumb.name}</span>
                  ) : (
                    <Link to={`/categories/${crumb.slug}`} className="hover:text-white transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {category.icon} {category.name}
            </h1>
            <p className="text-white/70">{category.description} • {allCategoryProducts.length} products</p>
          </div>
        </div>
      </div>

      {/* Other Categories */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {relatedCategories.slice(0, 8).map(cat => (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${cat.slug === slug ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <ProductsCardAll
          products={paginatedProducts}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-10 w-10 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {allCategoryProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">No products found in this category.</p>
            <Link to="/products">
              <button className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700">Browse All Products</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
