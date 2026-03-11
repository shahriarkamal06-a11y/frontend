import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  Percent,
  ToggleLeft,
  ToggleRight,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils';
import { categoryAPI, couponAPI, productAPI } from '../../services/api';
import { normalizeCategory } from '../../hooks/useApi';
import { buildCategoryTree, flattenCategoryTree, getCategoryOptionLabel } from '../../utils/categoryTree';

const getCouponStatus = (coupon) => {
  if (!coupon.isActive) return 'inactive';
  if (coupon.endDate && new Date(coupon.endDate) < new Date()) return 'expired';
  return 'active';
};

const normalizeCoupon = (coupon) => {
  const normalized = {
    id: coupon.id,
    code: coupon.code,
    type: coupon.discountType === 'FIXED' ? 'fixed' : 'percentage',
    value: coupon.discountValue ?? 0,
    minOrder: coupon.minOrderAmount ?? 0,
    maxDiscount: coupon.maxDiscount ?? '',
    usageLimit: coupon.usageLimit ?? '',
    usageCount: coupon.usedCount ?? 0,
    startDate: coupon.startsAt ? String(coupon.startsAt).slice(0, 10) : '',
    endDate: coupon.expiresAt ? String(coupon.expiresAt).slice(0, 10) : '',
    description: coupon.description || '',
    products: coupon.applicableProducts || [],
    categories: coupon.applicableCategories || [],
    status: 'active',
    createdAt: coupon.createdAt || new Date().toISOString(),
  };

  const appliesTo = normalized.products.length > 0
    ? 'products'
    : normalized.categories.length > 0
      ? 'categories'
      : 'all';

  return {
    ...normalized,
    appliesTo,
    status: getCouponStatus({ ...normalized, isActive: coupon.isActive !== false }),
    isActive: coupon.isActive !== false,
  };
};

const dateToIsoStart = (value) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);
const dateToIsoEnd = (value) => (value ? new Date(`${value}T23:59:59`).toISOString() : null);

const defaultCouponForm = {
  code: '',
  type: 'percentage',
  value: 10,
  minOrder: 0,
  maxDiscount: '',
  usageLimit: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  description: '',
  appliesTo: 'all',
  categories: [],
  products: [],
  status: 'active',
};

const statColorClass = {
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  rose: 'text-rose-600',
  violet: 'text-violet-600',
};

const AdminCoupons = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [couponResponse, productResponse, categoryResponse] = await Promise.all([
        couponAPI.getCoupons({ limit: 200 }),
        productAPI.getProducts({ limit: 200, active: 'true' }),
        categoryAPI.getCategories({ limit: 500, page: 1 }),
      ]);

      setCoupons((couponResponse.data?.data?.items || []).map(normalizeCoupon));
      setProducts(productResponse.data?.data?.items || []);
      const categoryItems = categoryResponse.data?.data?.items || [];
      const normalizedCategories = categoryItems.map(normalizeCategory);
      const categoryTree = buildCategoryTree(normalizedCategories);
      setCategories(flattenCategoryTree(categoryTree));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load coupons');
      setCoupons([]);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    return [...coupons]
      .filter((coupon) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          coupon.code.toLowerCase().includes(query) ||
          coupon.description.toLowerCase().includes(query);
        const matchesStatus = filterStatus === 'all' || coupon.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'code-asc': return a.code.localeCompare(b.code);
          case 'code-desc': return b.code.localeCompare(a.code);
          case 'usage': return b.usageCount - a.usageCount;
          case 'newest':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [coupons, filterStatus, searchQuery, sortBy]);

  const handleToggleStatus = async (coupon) => {
    try {
      setSubmittingId(coupon.id);
      const payload = { isActive: !coupon.isActive };
      const response = await couponAPI.updateCoupon(coupon.id, payload);
      const updated = normalizeCoupon(response.data.data);
      setCoupons((current) => current.map((item) => (item.id === coupon.id ? updated : item)));
      toast.success(updated.isActive ? 'Coupon activated' : 'Coupon deactivated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update coupon');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      setSubmittingId(couponId);
      await couponAPI.deleteCoupon(couponId);
      setCoupons((current) => current.filter((coupon) => coupon.id !== couponId));
      toast.success('Coupon deleted');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Coupon code copied');
      window.setTimeout(() => setCopiedCode(''), 1500);
    } catch {
      toast.error('Failed to copy coupon code');
    }
  };

  const handleSaveCoupon = async (couponData) => {
    const payload = {
      code: couponData.code.trim().toUpperCase(),
      description: couponData.description.trim() || undefined,
      discountType: couponData.type === 'fixed' ? 'FIXED' : 'PERCENTAGE',
      discountValue: Number(couponData.value),
      minOrderAmount: Number(couponData.minOrder || 0),
      maxDiscount: couponData.maxDiscount === '' ? null : Number(couponData.maxDiscount),
      usageLimit: couponData.usageLimit === '' ? null : Number(couponData.usageLimit),
      perUserLimit: 1,
      applicableProducts: couponData.appliesTo === 'products' ? couponData.products : [],
      applicableCategories: couponData.appliesTo === 'categories' ? couponData.categories : [],
      startsAt: dateToIsoStart(couponData.startDate),
      expiresAt: dateToIsoEnd(couponData.endDate),
      isActive: couponData.status === 'active',
    };

    try {
      const response = editingCoupon
        ? await couponAPI.updateCoupon(editingCoupon.id, payload)
        : await couponAPI.createCoupon(payload);

      const savedCoupon = normalizeCoupon(response.data.data);
      setCoupons((current) => {
        if (editingCoupon) {
          return current.map((item) => (item.id === editingCoupon.id ? savedCoupon : item));
        }
        return [savedCoupon, ...current];
      });
      setShowModal(false);
      setEditingCoupon(null);
      toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save coupon');
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'inactive': return 'bg-slate-100 text-slate-600';
      case 'expired': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons & Discounts</h1>
          <p className="text-slate-500 mt-1">Manage promo codes, product/category targeting, and coupon activation.</p>
        </div>
        <button
          onClick={() => { setEditingCoupon(null); setShowModal(true); }}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 hover:from-violet-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Coupons', value: coupons.filter((coupon) => coupon.status === 'active').length, color: 'emerald' },
          { label: 'Total Usage', value: coupons.reduce((sum, coupon) => sum + coupon.usageCount, 0).toLocaleString(), color: 'blue' },
          { label: 'Expired', value: coupons.filter((coupon) => coupon.status === 'expired').length, color: 'rose' },
          {
            label: 'Avg Discount',
            value: coupons.length > 0
              ? `${Math.round(coupons.reduce((sum, coupon) => sum + Number(coupon.value || 0), 0) / coupons.length)}${coupons.some((coupon) => coupon.type === 'percentage') ? '%' : ''}`
              : '0',
            color: 'violet',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${statColorClass[stat.color] || 'text-slate-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="code-asc">Code A-Z</option>
              <option value="code-desc">Code Z-A</option>
              <option value="usage">Most Used</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Applies To</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Valid Period</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                        <Percent className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{coupon.code}</p>
                        <p className="text-xs text-slate-500">{coupon.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Min: {coupon.minOrder > 0 ? formatCurrency(coupon.minOrder) : 'None'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">
                      {coupon.appliesTo === 'products' && `${coupon.products.length} products`}
                      {coupon.appliesTo === 'categories' && `${coupon.categories.length} categories`}
                      {coupon.appliesTo === 'all' && 'All products'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${coupon.usageLimit ? Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100) : Math.min(coupon.usageCount / 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">
                        {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{coupon.startDate ? formatDate(coupon.startDate) : 'No start'}</p>
                    <p className="text-xs text-slate-500">to {coupon.endDate ? formatDate(coupon.endDate) : 'No expiry'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                      {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        disabled={submittingId === coupon.id}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all disabled:opacity-50"
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingCoupon(coupon); setShowModal(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        disabled={submittingId === coupon.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No coupons found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <CouponModal
            coupon={editingCoupon}
            categories={categories}
            products={products}
            onClose={() => { setShowModal(false); setEditingCoupon(null); }}
            onSave={handleSaveCoupon}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CouponModal = ({ coupon, categories, products, onClose, onSave }) => {
  const [formData, setFormData] = useState(coupon || defaultCouponForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMultiSelect = (field, values) => {
    setFormData((current) => ({ ...current, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {coupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Coupon Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData((current) => ({ ...current, code: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono text-lg uppercase"
              placeholder="SAVE20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Discount Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((current) => ({ ...current, type: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discount Value {formData.type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData((current) => ({ ...current, value: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Order ($)</label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData((current) => ({ ...current, minOrder: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Discount ($)</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData((current) => ({ ...current, maxDiscount: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                min="0"
                placeholder="No limit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData((current) => ({ ...current, usageLimit: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                min="1"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((current) => ({ ...current, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((current) => ({ ...current, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
              rows="2"
              placeholder="Brief description of this coupon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Applies To</label>
            <select
              value={formData.appliesTo}
              onChange={(e) => setFormData((current) => ({
                ...current,
                appliesTo: e.target.value,
                categories: e.target.value === 'categories' ? current.categories : [],
                products: e.target.value === 'products' ? current.products : [],
              }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">All Products</option>
              <option value="categories">Specific Categories</option>
              <option value="products">Specific Products</option>
            </select>
          </div>

          {formData.appliesTo === 'categories' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Categories</label>
              <select
                multiple
                value={formData.categories}
                onChange={(e) => handleMultiSelect('categories', Array.from(e.target.selectedOptions, (option) => option.value))}
                className="w-full min-h-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} title={category.pathLabel || category.name}>
                    {getCategoryOptionLabel(category)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple categories.</p>
            </div>
          )}

          {formData.appliesTo === 'products' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Products</label>
              <select
                multiple
                value={formData.products}
                onChange={(e) => handleMultiSelect('products', Array.from(e.target.selectedOptions, (option) => option.value))}
                className="w-full min-h-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple products.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-4">
              {['active', 'inactive'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData((current) => ({ ...current, status: e.target.value }))}
                    className="text-violet-600"
                  />
                  <span className="text-sm text-slate-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : coupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminCoupons;
