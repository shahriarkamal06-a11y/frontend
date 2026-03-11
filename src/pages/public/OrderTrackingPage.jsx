import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Truck, Package, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { orderAPI } from '../../services/api';

const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const statusLabel = useMemo(
    () => (order?.status || 'PENDING').replace(/_/g, ' '),
    [order?.status]
  );

  const loadOrder = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const response = await orderAPI.getOrderById(id);
      setOrder(response?.data?.data || null);
      setSearchParams({ order: id });
    } catch (err) {
      setOrder(null);
      setError(err?.response?.data?.message || 'Unable to track this order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) {
      setError('Please enter a valid order ID.');
      return;
    }
    await loadOrder(id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-violet-100 text-lg max-w-2xl mx-auto">
            Enter your order ID to view real-time status.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto -mt-16 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Order ID</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Paste your order UUID"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {order && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Order</p>
                  <p className="text-lg font-bold text-slate-900">{order.orderNumber || order.id}</p>
                  <p className="text-sm text-slate-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium capitalize">{statusLabel.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">{formatCurrency(item.total || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipment
                  </h3>
                  <p className="text-sm text-slate-600">Status: {statusLabel}</p>
                  <p className="text-sm text-slate-600 mt-1">Method: {order.shippingMethod || 'standard'}</p>
                  <p className="text-sm text-slate-600 mt-1">Tracking: {order.trackingNumber || 'Pending'}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal || 0)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatCurrency(order.tax || 0)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{formatCurrency(order.shippingCost || 0)}</span></div>
                    <div className="flex justify-between text-slate-900 font-semibold pt-2 border-t border-slate-200"><span>Total</span><span>{formatCurrency(order.total || 0)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link to={`/orders/${order.id}`} className="text-violet-600 font-medium hover:text-violet-700">
                View Full Order Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
