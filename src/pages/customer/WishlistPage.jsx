import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils';
import { useCartStore, useWishlistStore } from '../../store';

const WishlistPage = () => {
  const {
    items,
    removeItem,
    loadWishlist,
    isLoading,
  } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (itemId) => {
    const result = await removeItem(itemId);
    if (!result?.success && result?.error) {
      toast.error(result.error);
    }
  };

  const handleAddToCart = async (item) => {
    if (!item?.productId) return;

    const result = await addToCart({ id: item.productId }, item.variantId, 1);
    if (result?.success) {
      toast.success('Added to cart');
      return;
    }

    toast.error(result?.error || 'Failed to add to cart');
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="h-12 w-12 text-rose-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your Wishlist is Empty</h2>
        <p className="text-slate-500 mb-6">Save items you love for later.</p>
        <Link to="/products">
          <button className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-2xl shadow-lg shadow-violet-500/25 text-sm">
            Explore Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            My Wishlist <span className="text-slate-400 text-lg font-normal">({items.length} items)</span>
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((item) => {
              const price = Number(item.price) || 0;
              const comparePrice = Number(item.compareAtPrice);
              const hasComparePrice = comparePrice > price;
              const discount = hasComparePrice
                ? Math.round(((comparePrice - price) / comparePrice) * 100)
                : 0;

              return (
                <div key={item.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover-card relative">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 z-10 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative aspect-square product-image-zoom bg-slate-50">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <Package className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 badge bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-medium text-sm text-slate-800 mb-1 line-clamp-2 hover:text-violet-700">{item.name}</h3>
                    </Link>
                    <p className="text-xs text-slate-400 mb-3">{item.variantName || 'Default option'}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-lg text-slate-900">{formatCurrency(price)}</span>
                      {hasComparePrice && <span className="text-sm text-slate-400 line-through">{formatCurrency(comparePrice)}</span>}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock <= 0}
                      className="w-full py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
