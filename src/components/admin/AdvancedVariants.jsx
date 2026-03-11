import { useMemo, useState } from 'react';
import { Plus, X, AlertCircle, Copy, Move, Eye, EyeOff, Shuffle, Grid, List, Settings } from 'lucide-react';

const AdvancedVariants = ({ variants = [], onUpdate, basePrice = 0, errors = {} }) => {
  const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table'
  const [showInactive, setShowInactive] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatorOptions, setGeneratorOptions] = useState([
    { id: 'opt-size', name: 'Size', values: '' },
    { id: 'opt-color', name: 'Color', values: '' },
  ]);

  const createEmptyVariant = () => ({
    id: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    optionValues: '',
    sku: '',
    price: basePrice || '',
    compareAtPrice: '',
    quantity: 0,
    imageUrl: '',
    weight: '',
    isActive: true,
    attributes: {},
  });

  const addVariant = () => {
    onUpdate([...variants, createEmptyVariant()]);
  };

  const updateVariant = (variantId, field, value) => {
    const updatedVariants = variants.map(variant => {
      if (variant.id === variantId) {
        const updated = { ...variant, [field]: value };
        
        // Parse option values into attributes
        if (field === 'optionValues') {
          updated.attributes = parseOptionValues(value);
        }
        
        return updated;
      }
      return variant;
    });
    onUpdate(updatedVariants);
  };

  const removeVariant = (variantId) => {
    onUpdate(variants.filter(variant => variant.id !== variantId));
  };

  const duplicateVariant = (variantId) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      const duplicated = {
        ...variant,
        id: createEmptyVariant().id,
        name: `${variant.name} (Copy)`,
        sku: variant.sku ? `${variant.sku}-COPY` : '',
      };
      onUpdate([...variants, duplicated]);
    }
  };

  const parseOptionValues = (optionString) => {
    if (!optionString) return {};
    
    return optionString
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .reduce((acc, entry) => {
        const [key, ...valueParts] = entry.split(':');
        const cleanKey = key?.trim().toLowerCase();
        const value = valueParts.join(':').trim();
        
        if (cleanKey && value) {
          acc[cleanKey] = value;
        }
        return acc;
      }, {});
  };

  const formatOptionValues = (attributes = {}) => {
    return Object.entries(attributes)
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const normalizeOptionKey = (value) => String(value || '').trim().toLowerCase();
  const normalizeOptionValue = (value) => String(value || '').trim();
  const normalizeAttributes = (attributes = {}) => (
    Object.entries(attributes).reduce((acc, [key, value]) => {
      const normalizedKey = normalizeOptionKey(key);
      const normalizedValue = normalizeOptionValue(value);
      if (normalizedKey && normalizedValue) {
        acc[normalizedKey] = normalizedValue;
      }
      return acc;
    }, {})
  );
  const buildAttributeKey = (attributes = {}) => (
    Object.keys(attributes)
      .sort()
      .map((key) => `${normalizeOptionKey(key)}:${normalizeOptionValue(attributes[key]).toLowerCase()}`)
      .join('|')
  );
  const getVariantAttributes = (variant) => {
    if (!variant) return {};
    if (variant.attributes && Object.keys(variant.attributes).length > 0) {
      return normalizeAttributes(variant.attributes);
    }
    if (variant.optionValues) {
      return normalizeAttributes(parseOptionValues(variant.optionValues));
    }
    return {};
  };

  const updateGeneratorOption = (optionId, field, value) => {
    setGeneratorOptions((prev) => prev.map((option) => (
      option.id === optionId ? { ...option, [field]: value } : option
    )));
  };

  const addGeneratorOption = () => {
    setGeneratorOptions((prev) => ([
      ...prev,
      { id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: '', values: '' },
    ]));
  };

  const removeGeneratorOption = (optionId) => {
    setGeneratorOptions((prev) => prev.filter((option) => option.id !== optionId));
  };

  const parsedGeneratorOptions = useMemo(() => (
    generatorOptions
      .map((option) => {
        const name = String(option.name || '').trim();
        const values = String(option.values || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
        if (!name || values.length === 0) return null;
        return {
          label: name,
          key: normalizeOptionKey(name),
          values,
        };
      })
      .filter(Boolean)
  ), [generatorOptions]);

  const generatorCount = useMemo(() => {
    if (!parsedGeneratorOptions.length) return 0;
    return parsedGeneratorOptions.reduce((total, option) => total * option.values.length, 1);
  }, [parsedGeneratorOptions]);

  const buildCombinations = (options) => {
    if (!options.length) return [];
    const [first, ...rest] = options;
    if (!rest.length) {
      return first.values.map((value) => ({
        attributes: { [first.key]: value },
        label: value,
      }));
    }

    const restCombinations = buildCombinations(rest);
    const combinations = [];

    first.values.forEach((value) => {
      restCombinations.forEach((combo) => {
        combinations.push({
          attributes: { [first.key]: value, ...combo.attributes },
          label: `${value} / ${combo.label}`,
        });
      });
    });

    return combinations;
  };

  const generateVariantsFromOptions = () => {
    if (!parsedGeneratorOptions.length) return;

    const combinations = buildCombinations(parsedGeneratorOptions);
    const existingByKey = new Map();
    const usedExistingIds = new Set();

    variants.forEach((variant) => {
      const attributes = getVariantAttributes(variant);
      if (Object.keys(attributes).length === 0) return;
      existingByKey.set(buildAttributeKey(attributes), variant);
    });

    const generatedVariants = combinations.map((combo) => {
      const comboKey = buildAttributeKey(combo.attributes);
      const existing = existingByKey.get(comboKey);
      if (existing) {
        usedExistingIds.add(existing.id);
        return {
          ...existing,
          attributes: combo.attributes,
          optionValues: formatOptionValues(combo.attributes),
          name: existing.name?.trim() ? existing.name : combo.label,
          price: existing.price ?? basePrice ?? '',
          isActive: existing.isActive !== false,
        };
      }

      return {
        ...createEmptyVariant(),
        name: combo.label,
        optionValues: formatOptionValues(combo.attributes),
        attributes: combo.attributes,
        price: basePrice || '',
        isActive: true,
      };
    });

    const leftoverVariants = variants.filter((variant) => !usedExistingIds.has(variant.id));
    onUpdate([...generatedVariants, ...leftoverVariants]);
  };

  const generateVariantCombinations = () => {
    // Smart variant generator
    const options = [
      { name: 'size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'color', values: ['Black', 'White', 'Navy', 'Gray', 'Red'] },
    ];
    
    const combinations = [];
    options[0].values.forEach(size => {
      options[1].values.forEach(color => {
        combinations.push({
          ...createEmptyVariant(),
          name: `${size} / ${color}`,
          optionValues: `size: ${size}, color: ${color}`,
          attributes: { size, color },
          sku: `${size}-${color}`.toUpperCase(),
        });
      });
    });
    
    onUpdate([...variants, ...combinations]);
  };

  const bulkUpdateSelected = (field, value) => {
    const updatedVariants = variants.map(variant => {
      if (selectedVariants.has(variant.id)) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    onUpdate(updatedVariants);
    setSelectedVariants(new Set());
  };

  const toggleVariantSelection = (variantId) => {
    const newSelected = new Set(selectedVariants);
    if (newSelected.has(variantId)) {
      newSelected.delete(variantId);
    } else {
      newSelected.add(variantId);
    }
    setSelectedVariants(newSelected);
  };

  const selectAllVariants = () => {
    const visibleVariants = variants.filter(v => showInactive || v.isActive);
    setSelectedVariants(new Set(visibleVariants.map(v => v.id)));
  };

  const clearSelection = () => {
    setSelectedVariants(new Set());
  };

  const showInactiveVariants = showAdvanced ? showInactive : false;
  const effectiveViewMode = showAdvanced ? viewMode : 'table';
  const isBulkEditActive = showAdvanced && bulkEditMode;
  const visibleVariants = variants.filter(variant => showInactiveVariants || variant.isActive);
  const activeCount = variants.filter(v => v.isActive).length;
  const inactiveCount = variants.length - activeCount;

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {visibleVariants.map((variant, index) => (
        <div key={variant.id} className={`rounded-xl border p-4 transition-all ${
          variant.isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
        } ${selectedVariants.has(variant.id) ? 'ring-2 ring-violet-500 border-violet-300' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isBulkEditActive && (
                <input
                  type="checkbox"
                  checked={selectedVariants.has(variant.id)}
                  onChange={() => toggleVariantSelection(variant.id)}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                />
              )}
              <h3 className="font-medium text-slate-900">
                Variant {index + 1}
                {!variant.isActive && (
                  <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                    Inactive
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => duplicateVariant(variant.id)}
                className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                title="Duplicate variant"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => updateVariant(variant.id, 'isActive', !variant.isActive)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title={variant.isActive ? 'Deactivate' : 'Activate'}
              >
                {variant.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Remove variant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Variant Name *
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm ${
                    errors[`variant-${index}-name`] ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Small / Blue"
                />
                {errors[`variant-${index}-name`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`variant-${index}-name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm"
                  placeholder="SHIRT-S-BLUE"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Options
              </label>
              <input
                type="text"
                value={variant.optionValues}
                onChange={(e) => updateVariant(variant.id, 'optionValues', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm"
                placeholder="size: S, color: Blue"
              />
              <p className="text-xs text-slate-500 mt-1">Format: size: S, color: Blue</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm ${
                    errors[`variant-${index}-price`] ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="0.00"
                />
                {errors[`variant-${index}-price`] && (
                  <p className="text-red-600 text-xs mt-1">{errors[`variant-${index}-price`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={variant.quantity}
                  onChange={(e) => updateVariant(variant.id, 'quantity', parseInt(e.target.value, 10) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={variant.imageUrl}
                onChange={(e) => updateVariant(variant.id, 'imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none text-sm"
                placeholder="https://example.com/variant.jpg"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border border-slate-200 rounded-lg">
        <thead className="bg-slate-50">
          <tr>
            {isBulkEditActive && (
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => e.target.checked ? selectAllVariants() : clearSelection()}
                  className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                />
              </th>
            )}
            <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Name</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">SKU</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Price</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Quantity</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Status</th>
            <th className="px-3 py-2 text-left text-sm font-medium text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleVariants.map((variant, index) => (
            <tr key={variant.id} className={`border-t border-slate-200 ${
              selectedVariants.has(variant.id) ? 'bg-violet-50' : 'hover:bg-slate-50'
            }`}>
              {isBulkEditActive && (
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedVariants.has(variant.id)}
                    onChange={() => toggleVariantSelection(variant.id)}
                    className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                  />
                </td>
              )}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  placeholder="Variant name"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  placeholder="SKU"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  placeholder="0.00"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={variant.quantity}
                  onChange={(e) => updateVariant(variant.id, 'quantity', parseInt(e.target.value, 10) || 0)}
                  min="0"
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  placeholder="0"
                />
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => updateVariant(variant.id, 'isActive', !variant.isActive)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    variant.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {variant.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => duplicateVariant(variant.id)}
                    className="p-1 text-slate-400 hover:text-violet-600 rounded"
                    title="Duplicate"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Variants
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Add sizes, colors, or other options with pricing and stock per variant.
          </p>
          {variants.length > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <span>{activeCount} active</span>
              {inactiveCount > 0 && <span>{inactiveCount} inactive</span>}
              <span>•</span>
              <span>{variants.length} total variants</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showAdvanced && variants.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowInactive(!showInactive)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  showInactive 
                    ? 'bg-slate-100 text-slate-700' 
                    : 'bg-slate-50 text-slate-500'
                }`}
              >
                {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setBulkEditMode(!bulkEditMode)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  bulkEditMode 
                    ? 'bg-violet-100 text-violet-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Bulk Edit
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
              showAdvanced ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </button>
        </div>
      </div>

      {!showAdvanced && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Auto-generate variants</h3>
              <p className="text-xs text-slate-500">Enter options like size and color to build all combinations.</p>
            </div>
            {generatorCount > 0 && (
              <span className="text-xs font-medium text-slate-600">{generatorCount} variants</span>
            )}
          </div>
          <div className="space-y-3">
            {generatorOptions.map((option) => (
              <div key={option.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Option name</label>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateGeneratorOption(option.id, 'name', e.target.value)}
                    placeholder="Size"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Values (comma separated)</label>
                  <input
                    type="text"
                    value={option.values}
                    onChange={(e) => updateGeneratorOption(option.id, 'values', e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeGeneratorOption(option.id)}
                    className="w-full px-3 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:text-rose-600 hover:border-rose-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addGeneratorOption}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Add option
            </button>
            <button
              type="button"
              onClick={generateVariantsFromOptions}
              disabled={generatorCount === 0}
              className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate variants
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {isBulkEditActive && selectedVariants.size > 0 && (
        <div className="mb-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-violet-900">
              {selectedVariants.size} variant{selectedVariants.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value === 'activate') bulkUpdateSelected('isActive', true);
                  if (e.target.value === 'deactivate') bulkUpdateSelected('isActive', false);
                  e.target.value = '';
                }}
                className="px-2 py-1 text-sm border border-violet-300 rounded bg-white"
              >
                <option value="">Bulk Actions</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
              </select>
              <button
                type="button"
                onClick={clearSelection}
                className="px-2 py-1 text-sm text-violet-700 hover:text-violet-900"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showAdvanced && variants.length === 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-200">
          <div className="flex items-start gap-3">
            <Shuffle className="h-5 w-5 text-violet-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-violet-900 mb-2">Quick Start Options</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateVariantCombinations}
                  className="px-3 py-2 bg-white text-violet-700 rounded-lg border border-violet-300 hover:border-violet-400 transition-colors text-sm"
                >
                  Generate Size × Color Matrix
                </button>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-3 py-2 bg-white text-violet-700 rounded-lg border border-violet-300 hover:border-violet-400 transition-colors text-sm"
                >
                  Start with Single Variant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variants Display */}
      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <Shuffle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No variants yet</h3>
          <p className="text-slate-500 mb-4">
            Add variants for different sizes, colors, materials, or any other product options
          </p>
        </div>
      ) : (
        <>
          {effectiveViewMode === 'grid' ? renderGridView() : renderTableView()}
        </>
      )}

      {/* Optimization Tips */}
      {showAdvanced && variants.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Variant Optimization Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use consistent naming: "Size / Color" format works best</li>
            <li>• Keep SKUs unique and descriptive for inventory tracking</li>
            <li>• Set different prices for premium variants (e.g., larger sizes)</li>
            <li>• Use variant images to show color/style differences</li>
            <li>• Deactivate out-of-stock variants instead of deleting them</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdvancedVariants;
