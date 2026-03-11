import { useState, useEffect } from 'react';
import { 
  X, Save, Plus, Trash2, AlertCircle, Settings, 
  ChevronDown, ChevronUp, Copy, Palette, Grid
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategoryOptionLabel } from '../../utils/categoryTree';

const MultiVariantProductForm = ({ product, onSave, onCancel, categories = [] }) => {
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
    hasVariants: false,
    variantAttributes: [], // [{ id: 'attr1', name: 'Color', values: ['red', 'blue'] }]
    variants: [], // [{ attributeCombination: { color: 'red', size: 'large' }, price: 10, quantity: 5 }]
    ...product
  });

  const [availableAttributes, setAvailableAttributes] = useState([
    { id: 'color', name: 'Color', displayType: 'color', values: [
      { value: 'red', displayName: 'Red', colorCode: '#DC2626' },
      { value: 'blue', displayName: 'Blue', colorCode: '#2563EB' },
      { value: 'green', displayName: 'Green', colorCode: '#16A34A' },
      { value: 'black', displayName: 'Black', colorCode: '#000000' },
      { value: 'white', displayName: 'White', colorCode: '#FFFFFF' }
    ]},
    { id: 'size', name: 'Size', displayType: 'button', values: [
      { value: 'xs', displayName: 'XS' },
      { value: 's', displayName: 'S' },
      { value: 'm', displayName: 'M' },
      { value: 'l', displayName: 'L' },
      { value: 'xl', displayName: 'XL' },
      { value: 'xxl', displayName: 'XXL' }
    ]},
    { id: 'material', name: 'Material', displayType: 'select', values: [
      { value: 'cotton', displayName: 'Cotton' },
      { value: 'polyester', displayName: 'Polyester' },
      { value: 'wool', displayName: 'Wool' },
      { value: 'silk', displayName: 'Silk' }
    ]}
  ]);

  const [showVariantBuilder, setShowVariantBuilder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({ ...formData, ...product });
      if (product.variants && product.variants.length > 0) {
        setFormData(prev => ({ ...prev, hasVariants: true }));
        setShowVariantBuilder(true);
      }
    }
  }, [product]);

  // Load available variant attributes from API
  useEffect(() => {
    const loadVariantAttributes = async () => {
      try {
        const response = await fetch('/api/products/variant-attributes');
        if (response.ok) {
          const data = await response.json();
          setAvailableAttributes(data.data || []);
        }
      } catch (error) {
        console.warn('Failed to load variant attributes:', error);
      }
    };
    loadVariantAttributes();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addVariantAttribute = (attributeId) => {
    const attribute = availableAttributes.find(attr => attr.id === attributeId);
    if (!attribute) return;

    const isAlreadyAdded = formData.variantAttributes.some(attr => attr.id === attributeId);
    if (isAlreadyAdded) {
      toast.error('This attribute is already added');
      return;
    }

    const newAttribute = {
      id: attribute.id,
      name: attribute.name,
      displayType: attribute.displayType,
      values: attribute.values.map(v => ({ ...v, selected: false }))
    };

    handleInputChange('variantAttributes', [...formData.variantAttributes, newAttribute]);
    generateVariantCombinations([...formData.variantAttributes, newAttribute]);
  };

  const removeVariantAttribute = (attributeId) => {
    const updatedAttributes = formData.variantAttributes.filter(attr => attr.id !== attributeId);
    handleInputChange('variantAttributes', updatedAttributes);
    generateVariantCombinations(updatedAttributes);
  };

  const toggleAttributeValue = (attributeId, valueId) => {
    const updatedAttributes = formData.variantAttributes.map(attr => {
      if (attr.id === attributeId) {
        return {
          ...attr,
          values: attr.values.map(val => 
            val.value === valueId ? { ...val, selected: !val.selected } : val
          )
        };
      }
      return attr;
    });

    handleInputChange('variantAttributes', updatedAttributes);
    generateVariantCombinations(updatedAttributes);
  };

  const generateVariantCombinations = (attributes = formData.variantAttributes) => {
    if (!attributes.length) {
      handleInputChange('variants', []);
      return;
    }

    // Get selected values for each attribute
    const selectedValuesByAttribute = attributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      values: attr.values.filter(val => val.selected)
    })).filter(attr => attr.values.length > 0);

    if (!selectedValuesByAttribute.length) {
      handleInputChange('variants', []);
      return;
    }

    // Generate all combinations
    const combinations = generateCombinations(selectedValuesByAttribute);
    
    // Create variants from combinations, preserving existing data
    const existingVariants = formData.variants || [];
    const newVariants = combinations.map(combination => {
      // Find existing variant with same combination
      const existing = existingVariants.find(variant => {
        const existingCombo = variant.attributeCombination || {};
        return Object.keys(combination).every(key => existingCombo[key] === combination[key]);
      });

      if (existing) {
        return { ...existing, attributeCombination: combination };
      }

      // Create new variant
      const name = Object.entries(combination)
        .map(([key, value]) => {
          const attr = selectedValuesByAttribute.find(a => a.id === key);
          const val = attr?.values.find(v => v.value === value);
          return val?.displayName || value;
        })
        .join(' / ');

      return {
        id: null,
        name,
        sku: '',
        price: parseFloat(formData.price) || 0,
        compareAtPrice: parseFloat(formData.compareAtPrice) || null,
        quantity: 0,
        attributeCombination: combination,
        imageUrl: '',
        weight: parseFloat(formData.weight) || null,
        isActive: true,
        sortOrder: 0
      };
    });

    handleInputChange('variants', newVariants);
  };

  const generateCombinations = (attributesWithValues) => {
    if (!attributesWithValues.length) return [];
    
    const [first, ...rest] = attributesWithValues;
    if (!rest.length) {
      return first.values.map(val => ({ [first.id]: val.value }));
    }

    const restCombinations = generateCombinations(rest);
    const combinations = [];

    for (const value of first.values) {
      for (const restCombo of restCombinations) {
        combinations.push({ [first.id]: value.value, ...restCombo });
      }
    }

    return combinations;
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    handleInputChange('variants', updatedVariants);
  };

  const duplicateVariant = (index) => {
    const variant = formData.variants[index];
    const duplicated = { ...variant, id: null, name: `${variant.name} (Copy)` };
    const updatedVariants = [...formData.variants];
    updatedVariants.splice(index + 1, 0, duplicated);
    handleInputChange('variants', updatedVariants);
  };

  const removeVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    handleInputChange('variants', updatedVariants);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    
    if (formData.hasVariants) {
      if (!formData.variantAttributes.length) {
        newErrors.variants = 'At least one variant attribute is required';
      } else if (!formData.variants.length) {
        newErrors.variants = 'At least one variant combination is required';
      }
    }
    
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
      const submitData = {
        ...formData,
        type: formData.hasVariants && formData.variants.length > 0 ? 'VARIABLE' : 'SIMPLE'
      };
      
      await onSave(submitData);
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAttributeValueSelector = (attribute) => {
    switch (attribute.displayType) {
      case 'color':
        return (
          <div className="flex flex-wrap gap-2">
            {attribute.values.map(value => (
              <button
                key={value.value}
                type="button"
                onClick={() => toggleAttributeValue(attribute.id, value.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  value.selected ? 'border-violet-500 scale-110' : 'border-slate-300'
                }`}
                style={{ backgroundColor: value.colorCode }}
                title={value.displayName}
              />
            ))}
          </div>
        );
      
      case 'button':
        return (
          <div className="flex flex-wrap gap-2">
            {attribute.values.map(value => (
              <button
                key={value.value}
                type="button"
                onClick={() => toggleAttributeValue(attribute.id, value.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  value.selected 
                    ? 'border-violet-500 bg-violet-50 text-violet-700' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {value.displayName}
              </button>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            {attribute.values.map(value => (
              <label key={value.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.selected}
                  onChange={() => toggleAttributeValue(attribute.id, value.value)}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                />
                <span className="text-sm text-slate-700">{value.displayName}</span>
              </label>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
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
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
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
                  value={formData.compareAtPrice}
                  onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Product Variants</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={(e) => {
                    handleInputChange('hasVariants', e.target.checked);
                    setShowVariantBuilder(e.target.checked);
                    if (!e.target.checked) {
                      handleInputChange('variantAttributes', []);
                      handleInputChange('variants', []);
                    }
                  }}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                />
                <span className="text-sm text-slate-700">This product has multiple variants</span>
              </label>
            </div>

            {formData.hasVariants && (
              <div className="border border-slate-200 rounded-xl p-6 space-y-6">
                {/* Variant Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-900">Variant Attributes</h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addVariantAttribute(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white"
                    >
                      <option value="">Add Attribute</option>
                      {availableAttributes
                        .filter(attr => !formData.variantAttributes.some(va => va.id === attr.id))
                        .map(attr => (
                          <option key={attr.id} value={attr.id}>{attr.name}</option>
                        ))}
                    </select>
                  </div>

                  {formData.variantAttributes.map(attribute => (
                    <div key={attribute.id} className="border border-slate-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-slate-800">{attribute.name}</h5>
                        <button
                          type="button"
                          onClick={() => removeVariantAttribute(attribute.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {renderAttributeValueSelector(attribute)}
                    </div>
                  ))}

                  {errors.variants && (
                    <p className="text-rose-600 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.variants}
                    </p>
                  )}
                </div>

                {/* Generated Variants */}
                {formData.variants.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">
                      Variant Combinations ({formData.variants.length})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="border border-slate-100 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Variant Name
                              </label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                SKU
                              </label>
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Price
                              </label>
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={variant.quantity}
                                onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                              />
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateVariant(index)}
                                className="p-2 text-slate-400 hover:text-violet-600 rounded"
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="p-2 text-slate-400 hover:text-rose-500 rounded"
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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

export default MultiVariantProductForm;
