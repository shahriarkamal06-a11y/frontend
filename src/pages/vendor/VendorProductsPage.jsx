import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Eye, Trash2, Package, TrendingUp, TrendingDown, Star, DollarSign, MoreVertical } from 'lucide-react';
import { formatCurrency } from '../../utils';
import PRODUCTS from '../../data/products';

const VendorProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const vendorProducts = PRODUCTS.slice(0, 15).map((product, index) => ({
    ...product,
    sku: `VENDOR-${String(index + 1).padStart(4, '0')}`,
    status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'draft' : 'out_of_stock',
    commission: product.price * 0.15,
    sales: Math.floor(Math.random() * 100),
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 50),
  }));

  const filteredProducts = vendorProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    active: { color: 'bg-emerald-50 text-emerald-700', label: 'Active' },
    draft: { color: 'bg-amber-50 text-amber-700', label: 'Draft' },
    out_of_stock: { color: 'bg-rose-50 text-rose-700', label: 'Out of Stock' },
  };

  const totalRevenue = vendorProducts.reduce((sum, p) => sum + (p.sales * p.commission), 0);
  const totalSales = vendorProducts.reduce((sum, p) => sum + p.sales, 0);
  const activeProducts = vendorProducts.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                My Products
              </h1>
              <p className="text-slate-600">Manage your product listings and inventory</p>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Products</span>
                <Package className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{vendorProducts.length}</p>
              <p className="text-sm text-emerald-600">{activeProducts} active</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Sales</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalSales}</p>
              <p className="text-sm text-emerald-600">↑ 12% this month</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Commission Earned</span>
                <DollarSign className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-emerald-600">15% rate</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Avg Rating</span>
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">4.2</p>
              <p className="text-sm text-slate-600">Across all products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <button className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="relative">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full ${statusConfig[product.status].color}`}>
                  {statusConfig[product.status].label}
                </span>
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all">
                  <MoreVertical className="h-4 w-4 text-slate-600" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <p className="text-xs text-slate-500 mb-1">{product.sku}</p>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-600">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.reviews})</span>
                  </div>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600">{product.sales} sold</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-emerald-600">{formatCurrency(product.commission)} commission</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Stock</p>
                    <p className={`text-sm font-medium ${
                      product.stock > 20 ? 'text-emerald-600' : 
                      product.stock > 0 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {product.stock}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-xs text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors flex items-center justify-center gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button className="flex-1 py-2 text-xs text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" /> View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductsPage;
