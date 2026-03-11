import { useState, useEffect } from 'react';
import { Save, ArrowLeft, Upload, X, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sectionAPI } from '../../services/api';
import AdvancedVariants from './AdvancedVariants';
import AdvancedQuantityBreaks from './AdvancedQuantityBreaks';
import { normalizeHomepageSection } from '../../utils/homepageSections';
import { getCategoryOptionLabel } from '../../utils/categoryTree';



const ShopifyProductForm = ({ product, onSave, onCancel, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: '',
    images: [],
    status: 'active',
    price: '',
    compareAtPrice: '',
    costPerItem: '',
    sku: '',
    barcode: '',
    trackQuantity: true,
    quantity: 0,
    continueSellingWhenOutOfStock: false,
    physicalProduct: true,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    seo: { title: '', description: '', url: '' },
    productType: '',
    vendor: '',
    tags: [],
    categoryId: '',
    section: '',
    variants: [],
    bulkPricing: [],
    ...product
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        ...product,
        categoryId: product.categoryId || '',
        section: product.section || product.sectionSlug || '',
        features: Array.isArray(product.features)
          ? product.features.map((item) => String(item || '').trim()).filter(Boolean).join('\n')
          : product.features || '',
        variants: Array.isArray(product.variants)
          ? product.variants.map((variant) => ({
              id: variant.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name: variant.name || '',
              optionValues: Object.entries(variant.attributes || {})
                .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
                .map(([key, value]) => `${key}: ${value}`)
                .join(', '),
              sku: variant.sku || '',
              price: variant.price ?? '',
              compareAtPrice: variant.compareAtPrice ?? '',
              quantity: variant.quantity ?? 0,
              imageUrl: variant.imageUrl || '',
              weight: variant.weight ?? '',
              isActive: variant.isActive !== false,
              attributes: variant.attributes || {},
            }))
          : [],
        bulkPricing: Array.isArray(product.bulkPricing)
          ? product.bulkPricing.map((rule) => ({
              id: rule.id || `bp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              minQty: rule.minQty ?? 2,
              maxQty: rule.maxQty ?? '',
              price: rule.price ?? '',
              discountType: rule.discountType || 'FIXED',
              discountValue: rule.discountValue ?? '',
              title: rule.title || '',
              description: rule.description || '',
              isActive: rule.isActive !== false,
            }))
          : [],
      }));
    }
    loadSections();
  }, [product]);

  const loadSections = async () => {
    try {
      const response = await sectionAPI.getSections({ type: 'PRODUCT_GRID', activeOnly: true });
      const items = response.data?.data?.items || [];
      setSections(items.map(normalizeHomepageSection));
    } catch (error) {
      console.error('Failed to load sections:', error);
      // Fallback to default sections
      setSections([
        { slug: 'featured', name: 'Featured Products', isActive: true, type: 'PRODUCT_GRID', content: {} },
        { slug: 'new-arrivals', name: 'New Arrivals', isActive: true, type: 'PRODUCT_GRID', content: {} },
        { slug: 'best-sellers', name: 'Best Sellers', isActive: true, type: 'PRODUCT_GRID', content: {} },
        { slug: 'flash-sale', name: 'Flash Sale', isActive: true, type: 'PRODUCT_GRID', content: {} },
        { slug: 'trending', name: 'Trending Now', isActive: true, type: 'PRODUCT_GRID', content: {} }
      ]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };



  const validateForm = () => {
    const newErrors = {};
    const price = Number(formData.price);
    const compareAtPrice = Number(formData.compareAtPrice);

    if (!formData.name.trim()) newErrors.name = 'Product title is required';
    if (!formData.price || price <= 0) newErrors.price = 'Price must be greater than 0';
    if (
      formData.compareAtPrice !== '' &&
      Number.isFinite(compareAtPrice) &&
      compareAtPrice <= price
    ) {
      newErrors.compareAtPrice = 'Compare-at price must be greater than price';
    }
    if (formData.categoryId && !categories.find((c) => c.id === formData.categoryId)) {
      newErrors.categoryId = 'Selected category is invalid';
    }
    formData.variants.forEach((variant, index) => {
      if (!variant.name?.trim()) {
        newErrors[`variant-${index}-name`] = 'Variant name is required';
      }
      if (variant.price === '' || Number(variant.price) < 0) {
        newErrors[`variant-${index}-price`] = 'Variant price must be 0 or more';
      }
    });
    formData.bulkPricing.forEach((rule, index) => {
      if (!rule.minQty || Number(rule.minQty) < 1) {
        newErrors[`bulk-${index}-minQty`] = 'Minimum quantity must be at least 1';
      }
      if (rule.price === '' || Number(rule.price) < 0) {
        newErrors[`bulk-${index}-price`] = 'Quantity break price must be 0 or more';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProfit = () => {
    const price = parseFloat(formData.price) || 0;
    const cost = parseFloat(formData.costPerItem) || 0;
    return price - cost;
  };

  const calculateMargin = () => {
    const price = parseFloat(formData.price) || 0;
    const cost = parseFloat(formData.costPerItem) || 0;
    if (price === 0) return 0;
    return ((price - cost) / price * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {product ? 'Edit product' : 'Add product'}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Product details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Short sleeve t-shirt"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                    placeholder="Describe your product..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Supports GitHub-flavored Markdown: headings, lists, tables, links, and emphasis.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Features
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => handleInputChange('features', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                    placeholder={"### Key Features\n\n| Feature | Details |\n| --- | --- |\n| Material | 100% Cotton |\n| Fit | Regular |\n\n- Breathable fabric\n- Machine washable"}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use this for detailed feature breakdowns and spec tables.
                  </p>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Media</h2>
              
              <div className="space-y-4">
                {/* Image URL Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = e.target.value.trim();
                          if (url) {
                            handleInputChange('images', [...formData.images, url]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        const url = input.value.trim();
                        if (url) {
                          handleInputChange('images', [...formData.images, url]);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Add images by uploading them, or drag and drop
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleInputChange('images', [...formData.images, event.target.result]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-sm"
                  >
                    Add files
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={typeof image === 'string' ? image : image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDEzLjc5IDkuNzkgMTAuMjEgMTIgOEMxNC4yMSAxMC4yMSAxNC4yMSAxMy43OSAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            handleInputChange('images', newImages);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                        errors.price ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Compare-at price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.compareAtPrice}
                      onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
                        errors.compareAtPrice ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.compareAtPrice && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.compareAtPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cost per item
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.costPerItem}
                      onChange={(e) => handleInputChange('costPerItem', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Customers won't see this
                  </p>
                </div>

                {(formData.price || formData.costPerItem) && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Profit:</span>
                        <span className="font-medium">${calculateProfit().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Margin:</span>
                        <span className="font-medium">{calculateMargin()}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="SKU-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Barcode (ISBN, UPC, GTIN, etc.)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="123456789012"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900">Quantity</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.trackQuantity}
                      onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Track quantity</span>
                  </label>
                </div>

                {formData.trackQuantity && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="0"
                    />

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.continueSellingWhenOutOfStock}
                        onChange={(e) => handleInputChange('continueSellingWhenOutOfStock', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Continue selling when out of stock</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <AdvancedVariants
              variants={formData.variants}
              onUpdate={(variants) => handleInputChange('variants', variants)}
              basePrice={parseFloat(formData.price) || 0}
              errors={errors}
            />

            <AdvancedQuantityBreaks
              bulkPricing={formData.bulkPricing}
              onUpdate={(bulkPricing) => handleInputChange('bulkPricing', bulkPricing)}
              basePrice={parseFloat(formData.price) || 0}
              errors={errors}
            />

            {/* Shipping */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping</h2>
              
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.physicalProduct}
                  onChange={(e) => handleInputChange('physicalProduct', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">This is a physical product</span>
              </label>

              {formData.physicalProduct && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Weight
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        step="0.01"
                        min="0"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        placeholder="0.0"
                      />
                      <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Product status</h2>
              
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Product Organization */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Product organization</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product type
                  </label>
                  <input
                    type="text"
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="e.g. Shirts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} title={category.pathLabel || category.name}>
                        {getCategoryOptionLabel(category)}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Section
                  </label>
                  <select
                    value={formData.section || ''}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select section</option>
                    {sections.filter(section => section.isActive !== false).map(section => (
                      <option key={section.slug} value={section.slug}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose which homepage section to display this product in
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(tagInput);
                          setTagInput('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Add tags..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addTag(tagInput);
                        setTagInput('');
                      }}
                      className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm flex items-center gap-1"
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
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShopifyProductForm;
