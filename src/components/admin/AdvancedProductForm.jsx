import { useState, useEffect } from 'react';
import { 
  X, Save, Upload, Image, Plus, Trash2, AlertCircle, Eye, EyeOff,
  ChevronDown, ChevronUp, Move, Copy, Settings, Tag, Package,
  DollarSign, BarChart3, Globe, Truck, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdvancedProductForm = ({ product, onSave, onCancel, categories = [], isPage = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [],
    status: 'draft',
    visibility: 'visible',
    // Pricing
    price: '',
    compareAtPrice: '',
    costPerItem: '',
    profit: '',
    margin: '',
    // Inventory
    sku: '',
    barcode: '',
    trackQuantity: true,
    quantity: 0,
    continueSellingWhenOutOfStock: false,
    // Shipping
    physicalProduct: true,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    // SEO
    seo: {
      title: '',
      description: '',
      url: ''
    },
    // Organization
    productType: '',
    vendor: '',
    collections: [],
    tags: [],
    // Variants
    hasVariants: false,
    variants: [],
    options: [],
    ...product
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [draggedImage, setDraggedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  const sections = [
    { id: 'basic', label: 'Product Details', icon: Package },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: BarChart3 },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'organization', label: 'Organization', icon: Tag },
    { id: 'variants', label: 'Variants', icon: Settings }
  ];

  useEffect(() => {
    if (product) {
      setFormData({ ...formData, ...product });
    }
  }, [product]);

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

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addVariantOption = () => {
    const newOption = {
      id: Date.now(),
      name: '',
      values: ['']
    };
    handleInputChange('options', [...formData.options, newOption]);
  };

  const updateVariantOption = (optionId, field, value) => {
    const updatedOptions = formData.options.map(option =>
      option.id === optionId ? { ...option, [field]: value } : option
    );
    handleInputChange('options', updatedOptions);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product title is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    
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

  const SectionButton = ({ section, isActive, onClick }) => {
    const Icon = section.icon;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
          isActive 
            ? 'bg-violet-50 text-violet-700 border-violet-200' 
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="font-medium">{section.label}</span>
      </button>
    );
  };

  const renderBasicSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${
            errors.name ? 'border-rose-300' : 'border-slate-200'
          }`}
          placeholder="Short sleeve t-shirt"
        />
        {errors.name && (
          <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
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
          rows={6}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none resize-none"
          placeholder="Describe your product..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Visibility
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => handleInputChange('visibility', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPricingSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Price *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              step="0.01"
              min="0"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${
                errors.price ? 'border-rose-300' : 'border-slate-200'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.price}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Compare-at price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              value={formData.compareAtPrice}
              onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Cost per item
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="number"
            value={formData.costPerItem}
            onChange={(e) => handleInputChange('costPerItem', e.target.value)}
            step="0.01"
            min="0"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
            placeholder="0.00"
          />
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Customers won't see this
        </p>
      </div>

      {(formData.price || formData.costPerItem) && (
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-3">Profit</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Profit:</span>
              <span className="font-medium text-slate-900 ml-2">
                ${calculateProfit().toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Margin:</span>
              <span className="font-medium text-slate-900 ml-2">
                {calculateMargin()}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInventorySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            SKU (Stock Keeping Unit)
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
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
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
            placeholder="123456789012"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-slate-900">Inventory</h4>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.trackQuantity}
              onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm text-slate-700">Track quantity</span>
          </label>
        </div>

        {formData.trackQuantity && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="0"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.continueSellingWhenOutOfStock}
                onChange={(e) => handleInputChange('continueSellingWhenOutOfStock', e.target.checked)}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">Continue selling when out of stock</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  const renderShippingSection = () => (
    <div className="space-y-6">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.physicalProduct}
          onChange={(e) => handleInputChange('physicalProduct', e.target.checked)}
          className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
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
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="0.0"
              />
              <select className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dimensions
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={formData.dimensions.length}
                onChange={(e) => handleNestedChange('dimensions', 'length', e.target.value)}
                step="0.01"
                min="0"
                className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="Length"
              />
              <input
                type="number"
                value={formData.dimensions.width}
                onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                step="0.01"
                min="0"
                className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="Width"
              />
              <input
                type="number"
                value={formData.dimensions.height}
                onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                step="0.01"
                min="0"
                className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                placeholder="Height"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSEOSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Page title
        </label>
        <input
          type="text"
          value={formData.seo.title}
          onChange={(e) => handleNestedChange('seo', 'title', e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
          placeholder="Product title for search engines"
        />
        <p className="text-sm text-slate-500 mt-1">
          {formData.seo.title.length}/70 characters used
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Meta description
        </label>
        <textarea
          value={formData.seo.description}
          onChange={(e) => handleNestedChange('seo', 'description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none resize-none"
          placeholder="Description for search engines"
        />
        <p className="text-sm text-slate-500 mt-1">
          {formData.seo.description.length}/160 characters used
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          URL handle
        </label>
        <div className="flex">
          <span className="px-4 py-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-500 text-sm">
            mystore.com/products/
          </span>
          <input
            type="text"
            value={formData.seo.url}
            onChange={(e) => handleNestedChange('seo', 'url', e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
            placeholder="product-handle"
          />
        </div>
      </div>
    </div>
  );

  const renderOrganizationSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product type
            </label>
            <input
              type="text"
              value={formData.productType}
              onChange={(e) => handleInputChange('productType', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
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
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              placeholder="Brand name"
            />
          </div>
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
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
              placeholder="Add tags..."
            />
            <button
              type="button"
              onClick={() => {
                addTag(tagInput);
                setTagInput('');
              }}
              className="px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
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
      </div>
    );
  };

  const renderMediaSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Product Images
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-violet-400 transition-colors">
          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Images</h3>
          <p className="text-slate-500 mb-4">
            Drag and drop your images here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="image-upload"
            onChange={(e) => {
              // Handle image upload
              console.log('Images selected:', e.target.files);
            }}
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            Choose Images
          </label>
        </div>
        
        {formData.images && formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url || image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter((_, i) => i !== index);
                    handleInputChange('images', newImages);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'basic': return renderBasicSection();
      case 'media': return renderMediaSection();
      case 'pricing': return renderPricingSection();
      case 'inventory': return renderInventorySection();
      case 'shipping': return renderShippingSection();
      case 'seo': return renderSEOSection();
      case 'organization': return renderOrganizationSection();
      default: return renderBasicSection();
    }
  };

  const containerClass = isPage
    ? "bg-white rounded-2xl max-w-6xl w-full overflow-hidden flex shadow-lg"
    : "bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex";

  const wrapperClass = isPage 
    ? "" 
    : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4";

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {sections.map(section => (
              <SectionButton
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {renderSection()}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Saving...' : (product ? 'Save Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedProductForm;
