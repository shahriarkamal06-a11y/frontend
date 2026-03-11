import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils';
import { useCartStore } from '../../store';

const CartPage = () => {
  const {
    items,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    couponCode,
    isLoading,
    loadCart,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (id, currentQty, delta) => {
    const nextQuantity = Math.max(1, currentQty + delta);
    const result = await updateItem(id, nextQuantity);
    if (!result?.success && result?.error) {
      toast.error(result.error);
    }
  };

  const handleRemoveItem = async (id) => {
    const result = await removeItem(id);
    if (!result?.success && result?.error) {
      toast.error(result.error);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    const result = await applyCoupon(code);
    if (result?.success) {
      toast.success('Coupon applied');
      setCouponInput('');
      return;
    }

    toast.error(result?.error || 'Failed to apply coupon');
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    toast.success('Coupon removed');
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your Cart is Empty</h2>
        <p className="text-slate-500 mb-6">Looks like you have not added anything yet.</p>
        <Link to="/products">
          <button className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all flex items-center gap-2 text-sm">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Shopping Cart <span className="text-slate-400 text-lg font-normal">({items.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
              </div>
            ) : (
              items.map((item) => {
                const imageUrl = item.imageUrl || item.image_url;
                return (
                  <div key={item.id} className="flex gap-4 p-4 lg:p-6 bg-white rounded-2xl border border-slate-100">
                    <Link to={`/products/${item.slug}`} className="shrink-0 w-24 h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-slate-50">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Package className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/products/${item.slug}`}>
                            <h3 className="font-semibold text-slate-900 hover:text-violet-600 transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-sm text-slate-400 mt-0.5">{item.variantName || 'Default'}</p>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity, -1)} className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-10 text-center text-sm font-semibold border-x border-slate-200">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity, 1)} className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-900">{formatCurrency(Number(item.price) * item.quantity)}</p>
                          {item.quantity > 1 && <p className="text-xs text-slate-400">{formatCurrency(Number(item.price))} each</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:sticky lg:top-24">
              <h3 className="font-bold text-lg text-slate-900 mb-6">Order Summary</h3>

              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                    className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
                {couponCode && (
                  <div className="flex items-center justify-between mt-2 p-2 bg-emerald-50 rounded-lg">
                    <span className="text-xs text-emerald-700 font-medium">Code "{couponCode}" applied</span>
                    <button onClick={handleRemoveCoupon} className="text-xs text-emerald-600 hover:underline">Remove</button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Shipping
                    {shipping === 0 && <Truck className="h-3.5 w-3.5 text-emerald-500" />}
                  </span>
                  <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatCurrency(shipping)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-lg text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <button className="w-full mt-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all flex items-center justify-center gap-2 text-sm">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

              <Link to="/products">
                <button className="w-full mt-3 py-3 text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
