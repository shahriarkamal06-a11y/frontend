import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Search, Filter, Edit, Trash2, Eye, Star, 
  TrendingUp, AlertCircle, CheckCircle, X, Upload, Save,
  Grid, List, MoreVertical, Copy, Archive, RefreshCw, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import BulkImportModal from '../../components/admin/BulkImportModal';
import { productAPI, categoryAPI } from '../../services/api';
import { normalizeCategory } from '../../hooks/useApi';
import {
  buildCategoryTree,
  flattenCategoryTree,
  getCategoryDescendants,
  getCategoryOptionLabel,
} from '../../utils/categoryTree';

const extractApiErrorMessage = (error, fallback = 'Request failed') => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];
    if (typeof firstError === 'string') return firstError;
    if (typeof firstError?.message === 'string') return firstError.message;
    if (typeof firstError?.error === 'string') return firstError.error;
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const AdminProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const categoryOptions = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);
  const selectedCategoryMeta = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return null;
    const selected = categories.find(
      (category) => category.id === selectedCategory || category.slug === selectedCategory
    );
    if (!selected) {
      return {
        ids: new Set([selectedCategory]),
        slugs: new Set([selectedCategory]),
      };
    }
    const descendants = getCategoryDescendants(categories, selected.id);
    return {
      ids: new Set([selected.id, ...descendants.map((item) => item.id)]),
      slugs: new Set([selected.slug, ...descendants.map((item) => item.slug).filter(Boolean)]),
    };
  }, [categories, selectedCategory]);

  useEffect(() => {
    console.log('Modal states:', { showBulkImportModal, showHelpModal });
  }, [showBulkImportModal, showHelpModal]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading products...');
      const response = await productAPI.getProducts();
      console.log('Products response:', response);
      console.log('Products data:', response.data);
      console.log('Products items:', response.data.data.items);
      setProducts(response.data.data.items || []);
      console.log('Products state set to:', response.data.data.items || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getCategories({ limit: 500, page: 1 });
      const items = response.data.data?.items || [];
      setCategories(items.map(normalizeCategory));
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productAPI.deleteProduct(productId);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkImport = async (importData) => {
    try {
      const response = await productAPI.bulkImportProducts(importData);
      loadProducts();
      const result = response?.data?.data || {};
      return {
        success: Array.isArray(result.success) ? result.success : [],
        errors: Array.isArray(result.errors) ? result.errors : []
      };
    } catch (error) {
      console.error('Bulk import error:', error);
      throw new Error(extractApiErrorMessage(error, 'Bulk import failed'));
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const productCategoryId = product.categoryId || product.category_id;
    const productCategorySlug = product.categorySlug || product.category_slug;
    const productCategoryName = product.categoryName || product.category_name || product.category;
    const matchesCategory = selectedCategory === 'all'
      || (selectedCategoryMeta?.ids?.has(productCategoryId))
      || (selectedCategoryMeta?.slugs?.has(productCategorySlug))
      || productCategoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  console.log('Current products state:', products);
  console.log('Filtered products:', filteredProducts);
  console.log('Search term:', searchTerm);
  console.log('Selected category:', selectedCategory);

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products first');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
          await productAPI.bulkDeleteProducts(selectedProducts);
          toast.success(`${selectedProducts.length} products deleted`);
          break;
        case 'activate':
          await productAPI.bulkUpdateProducts(selectedProducts, { isActive: true });
          toast.success(`${selectedProducts.length} products activated`);
          break;
        case 'deactivate':
          await productAPI.bulkUpdateProducts(selectedProducts, { isActive: false });
          toast.success(`${selectedProducts.length} products deactivated`);
          break;
      }
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      toast.error(`Bulk ${action} failed`);
    }
  };

  const ProductCard = ({ product }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <div className="relative">
        <img 
          src={product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
            (product.isActive !== false && product.status !== 'draft') 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {product.isActive !== false && product.status !== 'draft' ? 'active' : 'inactive'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <input
            type="checkbox"
            checked={selectedProducts.includes(product.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProducts([...selectedProducts, product.id]);
              } else {
                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
              }
            }}
            className="w-4 h-4 text-violet-600 bg-white border-2 border-white rounded focus:ring-violet-500"
          />
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500">{product.categoryName || product.category || 'Uncategorized'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">${product.price}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-slate-400 line-through">
                ${product.compareAtPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.avgRating || product.rating || 0}
          </div>
        </div>

        {product.section && (
          <div className="mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg capitalize">
              {product.sectionName || product.section.replace(/-/g, ' ')}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-slate-500">
            Stock: <span className={`font-medium ${(product.quantity || product.stock || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(product.quantity || product.stock || 0) > 0 ? `${product.quantity || product.stock} units` : 'Out of stock'}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Sales: <span className="font-medium text-slate-900">{product.soldCount || product.sales || 0}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            className="flex-1 py-2 text-sm text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </button>
          <button 
            onClick={() => navigate(`/products/${product.slug || product.id}`)}
            className="flex-1 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </button>
          <button className="px-3 py-2 text-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 
              className="h-3.5 w-3.5" 
              onClick={() => handleDeleteProduct(product.id)}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ProductRow = ({ product }) => {
    console.log('Rendering ProductRow for:', product.name);
    return (
      <tr className="hover:bg-slate-50/50">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedProducts.includes(product.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProducts([...selectedProducts, product.id]);
              } else {
                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
              }
            }}
            className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'} 
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="font-medium text-slate-900 text-sm">{product.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">{product.categoryName || product.category || 'Uncategorized'}</p>
                {product.section && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                    {product.sectionName || product.section.replace(/-/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">${product.price}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-slate-400 line-through">${product.compareAtPrice}</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
            (product.quantity || product.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {(product.quantity || product.stock || 0) > 0 ? `${product.quantity || product.stock} in stock` : 'Out of stock'}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
            (product.isActive !== false && product.status !== 'draft') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {product.isActive !== false && product.status !== 'draft' ? 'active' : 'inactive'}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{product.soldCount || product.sales || 0}</td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-sm text-slate-600">{product.avgRating || product.rating || 0}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
              className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={() => navigate(`/products/${product.slug || product.id}`)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              onClick={() => handleDeleteProduct(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
              Product Management
            </h1>
            <p className="text-slate-500 mt-1">Manage your store's product catalog</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-4 py-2.5 text-slate-600 bg-slate-100 font-medium rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
            <button
              onClick={() => {
                console.log('Bulk Import button clicked');
                setShowBulkImportModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 text-sm flex items-center gap-2 hover:shadow-xl transition-all"
            >
              <Upload className="h-4 w-4" />
              Bulk Import
            </button>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm w-full sm:w-80"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm bg-white"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id} title={category.pathLabel || category.name}>
                  {getCategoryOptionLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{selectedProducts.length} selected</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1.5 text-xs bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mb-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(filteredProducts.map(p => p.id));
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                      />
                    </th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sales</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <ProductRow key={product.id} product={product} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first product'
            }
          </p>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 mx-auto hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Your First Product
          </button>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          isOpen={showBulkImportModal}
          categories={categories}
          onClose={() => {
            console.log('Bulk import modal closed');
            setShowBulkImportModal(false);
          }}
          onImport={handleBulkImport}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Import/Export Help</h2>
            <p className="text-slate-600 mb-4">Help documentation will be loaded here.</p>
            <button
              onClick={() => setShowHelpModal(false)}
              className="px-4 py-2 bg-slate-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
