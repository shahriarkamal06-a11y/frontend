import { ArrowDown, ArrowUp, Search, Trash2 } from 'lucide-react';
import { sortProductsByIds } from '../../../utils/pageBuilder';
import { inputClassName, labelClassName } from './pageBuilderAdmin';

const PageBuilderBlockEditor = ({
  block,
  linkedProducts,
  productResults,
  loadingProductResults,
  productSearch,
  onProductSearchChange,
  onUpdateData,
  onToggleProduct,
  onMoveSelectedProduct,
  onAddFeatureItem,
  onRemoveFeatureItem,
}) => {
  if (!block) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        Select a block to edit its fields.
      </div>
    );
  }

  const data = block.data || {};
  const selectedProducts = sortProductsByIds(linkedProducts, data.productIds || []);

  if (block.type === 'hero') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Eyebrow</label>
          <input className={inputClassName} value={data.eyebrow || ''} onChange={(event) => onUpdateData({ eyebrow: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Heading</label>
          <input className={inputClassName} value={data.heading || ''} onChange={(event) => onUpdateData({ heading: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Body</label>
          <textarea className={`${inputClassName} min-h-32`} value={data.body || ''} onChange={(event) => onUpdateData({ body: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Background Image</label>
          <input className={inputClassName} placeholder="https://..." value={data.imageUrl || ''} onChange={(event) => onUpdateData({ imageUrl: event.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClassName}>Primary Label</label>
            <input className={inputClassName} value={data.primaryLabel || ''} onChange={(event) => onUpdateData({ primaryLabel: event.target.value })} />
          </div>
          <div>
            <label className={labelClassName}>Primary Link</label>
            <input className={inputClassName} placeholder="/products" value={data.primaryHref || ''} onChange={(event) => onUpdateData({ primaryHref: event.target.value })} />
          </div>
          <div>
            <label className={labelClassName}>Secondary Label</label>
            <input className={inputClassName} value={data.secondaryLabel || ''} onChange={(event) => onUpdateData({ secondaryLabel: event.target.value })} />
          </div>
          <div>
            <label className={labelClassName}>Secondary Link</label>
            <input className={inputClassName} placeholder="/contact" value={data.secondaryHref || ''} onChange={(event) => onUpdateData({ secondaryHref: event.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelClassName}>Alignment</label>
          <select className={inputClassName} value={data.align || 'left'} onChange={(event) => onUpdateData({ align: event.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.type === 'richText') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Heading</label>
          <input className={inputClassName} value={data.heading || ''} onChange={(event) => onUpdateData({ heading: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Body</label>
          <textarea className={`${inputClassName} min-h-48`} value={data.body || ''} onChange={(event) => onUpdateData({ body: event.target.value })} />
        </div>
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Image URL</label>
          <input className={inputClassName} placeholder="https://..." value={data.imageUrl || ''} onChange={(event) => onUpdateData({ imageUrl: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Alt Text</label>
          <input className={inputClassName} value={data.altText || ''} onChange={(event) => onUpdateData({ altText: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Caption</label>
          <textarea className={`${inputClassName} min-h-24`} value={data.caption || ''} onChange={(event) => onUpdateData({ caption: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Aspect</label>
          <select className={inputClassName} value={data.aspect || 'wide'} onChange={(event) => onUpdateData({ aspect: event.target.value })}>
            <option value="wide">Wide</option>
            <option value="square">Square</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.type === 'featureList') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Heading</label>
          <input className={inputClassName} value={data.heading || ''} onChange={(event) => onUpdateData({ heading: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Intro</label>
          <textarea className={`${inputClassName} min-h-24`} value={data.body || ''} onChange={(event) => onUpdateData({ body: event.target.value })} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClassName}>Items</label>
            <button
              type="button"
              onClick={onAddFeatureItem}
              className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Add item
            </button>
          </div>
          {(data.items || []).map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <input
                    className={inputClassName}
                    placeholder="Feature title"
                    value={item.title || ''}
                    onChange={(event) => onUpdateData({
                      items: (data.items || []).map((entry) => (
                        entry.id === item.id ? { ...entry, title: event.target.value } : entry
                      )),
                    })}
                  />
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    placeholder="Feature description"
                    value={item.description || ''}
                    onChange={(event) => onUpdateData({
                      items: (data.items || []).map((entry) => (
                        entry.id === item.id ? { ...entry, description: event.target.value } : entry
                      )),
                    })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFeatureItem(item.id)}
                  className="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'productGrid') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Heading</label>
          <input className={inputClassName} value={data.heading || ''} onChange={(event) => onUpdateData({ heading: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Intro</label>
          <textarea className={`${inputClassName} min-h-24`} value={data.body || ''} onChange={(event) => onUpdateData({ body: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Desktop Columns</label>
          <select className={inputClassName} value={String(data.columns || 3)} onChange={(event) => onUpdateData({ columns: Number(event.target.value) })}>
            <option value="2">2 columns</option>
            <option value="3">3 columns</option>
            <option value="4">4 columns</option>
          </select>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <label className={labelClassName}>Selected Products</label>
          <div className="space-y-3">
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-slate-500">No products linked yet.</p>
            ) : selectedProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <img src={product.images?.[0] || ''} alt="" className="h-12 w-12 rounded-2xl bg-slate-100 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="truncate text-xs text-slate-500">{product.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveSelectedProduct(product.id, -1)}
                    disabled={index === 0}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSelectedProduct(product.id, 1)}
                    disabled={index === selectedProducts.length - 1}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleProduct(product.id)}
                    className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <label className={labelClassName}>Find Products</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClassName} pl-10`}
              placeholder="Search products by name"
              value={productSearch}
              onChange={(event) => onProductSearchChange(event.target.value)}
            />
          </div>
          <div className="mt-4 space-y-3">
            {loadingProductResults ? (
              <p className="text-sm text-slate-500">Loading products...</p>
            ) : productResults.length === 0 ? (
              <p className="text-sm text-slate-500">No products matched this search.</p>
            ) : productResults.map((product) => {
              const selected = (data.productIds || []).includes(product.id);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onToggleProduct(product.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    selected
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <img src={product.images?.[0] || ''} alt="" className="h-12 w-12 rounded-2xl bg-white object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="truncate text-xs text-slate-500">{product.slug}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>
                    {selected ? 'Linked' : 'Add'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'cta') {
    return (
      <div className="space-y-4">
        <div>
          <label className={labelClassName}>Heading</label>
          <input className={inputClassName} value={data.heading || ''} onChange={(event) => onUpdateData({ heading: event.target.value })} />
        </div>
        <div>
          <label className={labelClassName}>Body</label>
          <textarea className={`${inputClassName} min-h-24`} value={data.body || ''} onChange={(event) => onUpdateData({ body: event.target.value })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClassName}>Primary Label</label>
            <input className={inputClassName} value={data.primaryLabel || ''} onChange={(event) => onUpdateData({ primaryLabel: event.target.value })} />
          </div>
          <div>
            <label className={labelClassName}>Primary Link</label>
            <input className={inputClassName} value={data.primaryHref || ''} onChange={(event) => onUpdateData({ primaryHref: event.target.value })} />
          </div>
          <div>
            <label className={labelClassName}>Secondary Label</label>
            <input className={inputClassName} value={data.secondaryLabel || ''} onChange={(event) => onUpdateData({ secondaryLabel: event.target.value })} />
          </div>
          <div>
            <label className={labelClassName}>Secondary Link</label>
            <input className={inputClassName} value={data.secondaryHref || ''} onChange={(event) => onUpdateData({ secondaryHref: event.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelClassName}>Tone</label>
          <select className={inputClassName} value={data.tone || 'dark'} onChange={(event) => onUpdateData({ tone: event.target.value })}>
            <option value="dark">Dark</option>
            <option value="brand">Brand gradient</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.type === 'spacer') {
    return (
      <div>
        <label className={labelClassName}>Spacing Size</label>
        <select className={inputClassName} value={data.size || 'md'} onChange={(event) => onUpdateData({ size: event.target.value })}>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
    );
  }

  return null;
};

export default PageBuilderBlockEditor;
