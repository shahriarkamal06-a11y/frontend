import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2, Package } from 'lucide-react';
import { useCartStore, useUIStore } from '../../store';
import { formatCurrency } from '../../utils';

const CartDrawer = () => {
  const {
    items,
    isLoading,
    loadCart,
    updateItem,
    removeItem,
  } = useCartStore();
  const { cartOpen, toggleCart } = useUIStore();

  useEffect(() => {
    if (cartOpen) {
      loadCart();
    }
  }, [cartOpen, loadCart]);

  const cartSubtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const handleUpdateQuantity = async (itemId, currentQty, delta) => {
    const nextQuantity = Math.max(1, currentQty + delta);
    await updateItem(itemId, nextQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeItem(itemId);
  };

  if (!cartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={toggleCart}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-left">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <ShoppingBag className="h-5 w-5 text-violet-600" />
            Shopping Cart
            <span className="text-sm text-slate-400 font-normal">({items.length})</span>
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-slate-500 mb-6">Start adding items to your cart</p>
              <button
                onClick={toggleCart}
                className="px-6 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const imageUrl = item.imageUrl || item.image_url;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-slate-50 rounded-xl group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-100');
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.variantName || 'Default'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold border-x border-slate-200">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-semibold text-sm text-slate-900">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition-colors self-start opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="font-medium text-slate-900">{cartSubtotal > 100 ? 'Free' : formatCurrency(10)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(cartSubtotal + (cartSubtotal > 100 ? 0 : 10))}
              </span>
            </div>
            <p className="text-xs text-slate-400">Taxes calculated at checkout</p>
            <div className="flex gap-2">
              <Link to="/cart" onClick={toggleCart} className="flex-1">
                <button className="w-full py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">
                  View Cart
                </button>
              </Link>
              <Link to="/checkout" onClick={toggleCart} className="flex-1">
                <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all text-sm flex items-center justify-center gap-2">
                  Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
