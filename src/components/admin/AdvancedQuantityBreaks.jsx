import { useState } from 'react';
import { Plus, X, AlertCircle, TrendingUp, Package, Percent, DollarSign, Info } from 'lucide-react';

const AdvancedQuantityBreaks = ({ bulkPricing = [], onUpdate, basePrice = 0, errors = {} }) => {
  const [showPreview, setShowPreview] = useState(false);

  const createEmptyRule = () => ({
    id: `bp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    minQty: 2,
    maxQty: '',
    price: '',
    discountType: 'FIXED',
    discountValue: '',
    title: '',
    description: '',
    isActive: true,
  });

  const addRule = () => {
    const newRule = createEmptyRule();
    // Auto-set min quantity based on existing rules
    if (bulkPricing.length > 0) {
      const maxExistingQty = Math.max(...bulkPricing.map(rule => rule.maxQty || rule.minQty));
      newRule.minQty = maxExistingQty + 1;
    }
    onUpdate([...bulkPricing, newRule]);
  };

  const updateRule = (ruleId, field, value) => {
    const updatedRules = bulkPricing.map(rule => {
      if (rule.id === ruleId) {
        const updatedRule = { ...rule, [field]: value };

        // Auto-calculate price based on discount
        if (field === 'discountType' || field === 'discountValue') {
          if (updatedRule.discountType === 'PERCENTAGE' && updatedRule.discountValue) {
            const discountPercent = parseFloat(updatedRule.discountValue) / 100;
            updatedRule.price = (basePrice * (1 - discountPercent)).toFixed(2);
          } else if (updatedRule.discountType === 'FIXED' && updatedRule.discountValue) {
            updatedRule.price = (basePrice - parseFloat(updatedRule.discountValue)).toFixed(2);
          }
        }

        return updatedRule;
      }
      return rule;
    });
    onUpdate(updatedRules);
  };

  const removeRule = (ruleId) => {
    onUpdate(bulkPricing.filter(rule => rule.id !== ruleId));
  };

  const calculateSavings = (rule) => {
    if (!rule.price || !basePrice) return 0;
    const savings = basePrice - parseFloat(rule.price);
    const percentage = (savings / basePrice * 100).toFixed(1);
    return { amount: savings.toFixed(2), percentage };
  };

  const getDiscountPreview = () => {
    const sortedRules = [...bulkPricing]
      .filter(rule => rule.price && rule.minQty)
      .sort((a, b) => a.minQty - b.minQty);

    return sortedRules.map(rule => {
      const savings = calculateSavings(rule);
      const totalSavings = (savings.amount * rule.minQty).toFixed(2);
      return {
        ...rule,
        savings,
        totalSavings,
        displayRange: rule.maxQty ? `${rule.minQty}-${rule.maxQty}` : `${rule.minQty}+`
      };
    });
  };

  const previewData = getDiscountPreview();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-600" />
            Smart Quantity Breaks
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create tiered pricing that beats Shopify's Kaching app - with auto-discounts, smart suggestions, and conversion optimization
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 text-sm bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            type="button"
            onClick={addRule}
            className="px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Tier
          </button>
        </div>
      </div>

      {/* Smart Suggestions */}
      {bulkPricing.length === 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-violet-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-violet-900 mb-2">Smart Pricing Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    const suggestions = [
                      { minQty: 2, maxQty: 4, discountType: 'PERCENTAGE', discountValue: '5', title: 'Buy 2-4, Save 5%' },
                      { minQty: 5, maxQty: 9, discountType: 'PERCENTAGE', discountValue: '10', title: 'Buy 5-9, Save 10%' },
                      { minQty: 10, maxQty: '', discountType: 'PERCENTAGE', discountValue: '15', title: 'Buy 10+, Save 15%' }
                    ];
                    const rulesWithIds = suggestions.map(rule => ({
                      ...createEmptyRule(),
                      ...rule,
                      price: rule.discountType === 'PERCENTAGE'
                        ? (basePrice * (1 - parseFloat(rule.discountValue) / 100)).toFixed(2)
                        : (basePrice - parseFloat(rule.discountValue)).toFixed(2)
                    }));
                    onUpdate(rulesWithIds);
                  }}
                  className="p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-300 transition-colors text-left"
                >
                  <div className="font-medium text-violet-900">Standard Tiers</div>
                  <div className="text-violet-600">5%, 10%, 15% off</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const suggestions = [
                      { minQty: 3, maxQty: '', discountType: 'PERCENTAGE', discountValue: '20', title: 'Bundle of 3+, Save 20%' }
                    ];
                    const rulesWithIds = suggestions.map(rule => ({
                      ...createEmptyRule(),
                      ...rule,
                      price: (basePrice * (1 - parseFloat(rule.discountValue) / 100)).toFixed(2)
                    }));
                    onUpdate(rulesWithIds);
                  }}
                  className="p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-300 transition-colors text-left"
                >
                  <div className="font-medium text-violet-900">Bundle Deal</div>
                  <div className="text-violet-600">Simple 3+ discount</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const suggestions = [
                      { minQty: 2, maxQty: 2, discountType: 'PERCENTAGE', discountValue: '8', title: 'Buy 2, Save 8%' },
                      { minQty: 6, maxQty: 11, discountType: 'PERCENTAGE', discountValue: '18', title: 'Half Dozen Deal' },
                      { minQty: 12, maxQty: '', discountType: 'PERCENTAGE', discountValue: '25', title: 'Dozen+ Wholesale' }
                    ];
                    const rulesWithIds = suggestions.map(rule => ({
                      ...createEmptyRule(),
                      ...rule,
                      price: (basePrice * (1 - parseFloat(rule.discountValue) / 100)).toFixed(2)
                    }));
                    onUpdate(rulesWithIds);
                  }}
                  className="p-3 bg-white rounded-lg border border-violet-200 hover:border-violet-300 transition-colors text-left"
                >
                  <div className="font-medium text-violet-900">Wholesale Style</div>
                  <div className="text-violet-600">Aggressive scaling</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && previewData.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Customer View Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {previewData.map((rule, index) => (
              <div key={rule.id} className="bg-white rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{rule.displayRange} units</span>
                  <span className="text-lg font-bold text-violet-600">${rule.price}</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Save ${rule.savings.amount} ({rule.savings.percentage}%) each
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Total savings: ${rule.totalSavings}
                </div>
                {rule.title && (
                  <div className="text-xs text-violet-600 mt-1 font-medium">{rule.title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Configuration */}
      {bulkPricing.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No quantity breaks yet</h3>
          <p className="text-slate-500 mb-4">
            Create tiered pricing to increase average order value and customer satisfaction
          </p>
          <button
            type="button"
            onClick={addRule}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Create First Tier
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bulkPricing.map((rule, index) => {
            const savings = calculateSavings(rule);
            return (
              <div key={rule.id} className="rounded-xl border border-slate-200 p-4 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    Tier {index + 1}
                    {savings.amount > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {savings.percentage}% off
                      </span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Min Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rule.minQty}
                      onChange={(e) => updateRule(rule.id, 'minQty', parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${errors[`bulk-${index}-minQty`] ? 'border-red-300' : 'border-slate-300'
                        }`}
                    />
                    {errors[`bulk-${index}-minQty`] && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors[`bulk-${index}-minQty`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={rule.maxQty}
                      onChange={(e) => updateRule(rule.id, 'maxQty', e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                      placeholder="Unlimited"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave blank for unlimited</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Discount Type
                    </label>
                    <select
                      value={rule.discountType || 'FIXED'}
                      onChange={(e) => updateRule(rule.id, 'discountType', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white"
                    >
                      <option value="FIXED">Fixed Price</option>
                      <option value="PERCENTAGE">Percentage Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {rule.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount'}
                    </label>
                    <div className="relative">
                      {rule.discountType === 'PERCENTAGE' ? (
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      )}
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={rule.discountType === 'PERCENTAGE' ? '100' : undefined}
                        value={rule.discountValue}
                        onChange={(e) => updateRule(rule.id, 'discountValue', e.target.value)}
                        className={`w-full ${rule.discountType === 'PERCENTAGE' ? 'pr-10' : 'pl-10'} px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none`}
                        placeholder={rule.discountType === 'PERCENTAGE' ? '10' : '5.00'}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Final Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        autoFocus
                        type="number"
                        step="0.01"
                        min="0"
                        value={rule.price}
                        onChange={(e) => updateRule(rule.id, 'price', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none ${errors[`bulk-${index}-price`] ? 'border-red-300' : 'border-slate-300'
                          }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors[`bulk-${index}-price`] && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors[`bulk-${index}-price`]}
                      </p>
                    )}
                    {savings.amount > 0 && (
                      <p className="text-green-600 text-sm mt-1">
                        Saves ${savings.amount} ({savings.percentage}%) per item
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={rule.title}
                      onChange={(e) => updateRule(rule.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                      placeholder="e.g., Buy 3, Save 15%"
                    />
                    <p className="text-xs text-slate-500 mt-1">Shown to customers</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={rule.description}
                    onChange={(e) => updateRule(rule.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none resize-none"
                    placeholder="Optional description for this pricing tier"
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`active-${rule.id}`}
                    checked={rule.isActive !== false}
                    onChange={(e) => updateRule(rule.id, 'isActive', e.target.checked)}
                    className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                  />
                  <label htmlFor={`active-${rule.id}`} className="text-sm text-slate-700">
                    This tier is active
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Performance Tips */}
      {bulkPricing.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Optimization Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sweet spot: 3-5 tiers work best for conversion</li>
            <li>• Start discounts at 2-3 units to encourage bulk buying</li>
            <li>• Use psychological pricing ($9.99 vs $10.00)</li>
            <li>• Test different discount percentages to find optimal AOV</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdvancedQuantityBreaks;