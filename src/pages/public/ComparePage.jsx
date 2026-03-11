import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Star, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { useProducts } from '../../hooks/useApi';

const MAX_COMPARE_ITEMS = 3;

const ComparePage = () => {
  const { products, loading } = useProducts({ limit: '60', page: '1' });
  const [compareIds, setCompareIds] = useState([]);
  const [query, setQuery] = useState('');

  const compareProducts = useMemo(
    () => compareIds.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [compareIds, products]
  );

  const selectableProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => !compareIds.includes(p.id))
      .filter((p) => {
        if (!q) return true;
        return (
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.brand || '').toLowerCase().includes(q) ||
          String(p.category || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [products, compareIds, query]);

  const addProduct = (id) => {
    if (compareIds.length >= MAX_COMPARE_ITEMS) return;
    if (compareIds.includes(id)) return;
    setCompareIds((prev) => [...prev, id]);
  };

  const removeProduct = (id) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const rows = [
    { label: 'Price', key: 'price', render: (p) => formatCurrency(p.price || 0) },
    { label: 'Brand', key: 'brand', render: (p) => p.brand || '-' },
    { label: 'Category', key: 'category', render: (p) => p.category || '-' },
    { label: 'Rating', key: 'rating', render: (p) => `${p.rating || 0} / 5` },
    { label: 'Reviews', key: 'reviewCount', render: (p) => p.reviewCount || 0 },
    { label: 'Stock', key: 'stock', render: (p) => (p.stock > 0 ? `${p.stock} available` : 'Out of stock') },
    { label: 'SKU', key: 'sku', render: (p) => p.sku || '-' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                Compare Products
              </h1>
              <p className="text-slate-600 mt-1">
                Select up to {MAX_COMPARE_ITEMS} products and compare real catalog data.
              </p>
            </div>
            {compareProducts.length > 0 && (
              <button
                onClick={() => setCompareIds([])}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products to add..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectableProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product.id)}
                disabled={compareIds.length >= MAX_COMPARE_ITEMS}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all disabled:opacity-60"
              >
                <p className="font-medium text-sm text-slate-900 line-clamp-1">{product.name}</p>
                <p className="text-xs text-slate-500">{product.brand || 'Brand N/A'}</p>
                <p className="text-sm font-semibold text-violet-600 mt-1">{formatCurrency(product.price || 0)}</p>
              </button>
            ))}
          </div>
        </div>

        {compareProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Products Selected</h2>
            <p className="text-slate-600">Use the search above to add products for comparison.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{product.name}</h3>
                      <p className="text-lg font-bold text-violet-600">{formatCurrency(product.price || 0)}</p>
                    </div>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all ml-2"
                    >
                      <X className="h-4 w-4 text-slate-500" />
                    </button>
                  </div>
                  <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden mb-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating || 0}</span>
                    <span className="text-slate-400">({product.reviewCount || 0} reviews)</span>
                  </div>
                  <Link
                    to={`/products/${product.slug}`}
                    className="w-full py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-all text-center block"
                  >
                    View Product
                  </Link>
                </div>
              ))}
              {compareProducts.length < MAX_COMPARE_ITEMS && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-4 flex items-center justify-center min-h-[220px]">
                  <div className="text-center text-slate-500">
                    <Plus className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Add another product</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Comparison Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Feature</th>
                      {compareProducts.map((product) => (
                        <th key={product.id} className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <td className="px-6 py-3 text-sm font-medium text-slate-700">{row.label}</td>
                        {compareProducts.map((product) => (
                          <td key={`${product.id}-${row.key}`} className="px-6 py-3 text-sm text-slate-600">
                            {row.render(product)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {compareProducts.map((product) => (
                <Link
                  key={`buy-${product.id}`}
                  to={`/products/${product.slug}`}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2"
                >
                  Buy {product.name.split(' ').slice(0, 2).join(' ')} - {formatCurrency(product.price || 0)}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <Link to="/products" className="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700">
            Continue Browsing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
