import { useState, useEffect } from 'react';
import { X, Save, Upload, Image, Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategoryOptionLabel } from '../../utils/categoryTree';

const ProductForm = ({ product, onSave, onCancel, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    barcode: '',
    categoryId: '',
    quantity: 0,
    lowStockThreshold: 5,
    weight: '',
    isActive: true,
    isDigital: false,
    tags: [],
    ...product
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({ ...formData, ...product });
    }
  }, [product]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      ...(name === 'name' && !product ? { slug: generateSlug(value) } : {})
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${
                  errors.name ? 'border-rose-300' : 'border-slate-200'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="product-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Short Description
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              placeholder="Detailed product description"
            />
          </div>

          {/* Pricing & Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${
                  errors.price ? 'border-rose-300' : 'border-slate-200'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Compare At Price
              </label>
              <input
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white ${
                  errors.categoryId ? 'border-rose-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} title={category.pathLabel || category.name}>
                    {getCategoryOptionLabel(category)}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.categoryId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="SKU-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${
                  errors.quantity ? 'border-rose-300' : 'border-slate-200'
                }`}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Low Stock Alert
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Status Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDigital"
                checked={formData.isDigital}
                onChange={handleInputChange}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">Digital Product</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
