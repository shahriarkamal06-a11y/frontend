import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils';
import { orderAPI } from '../../services/api';

const ORDER_FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'SHIPPED', label: 'Shipped' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'REFUNDED', label: 'Refunded' },
];

const OrdersPage = () => {
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const params = { limit: '50', page: '1' };
        if (filter !== 'all') {
          params.status = filter;
        }

        const response = await orderAPI.getOrders(params);
        const payload = response?.data?.data;
        setOrders(payload?.items || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [filter]);

  const orderCount = useMemo(() => orders.length, [orders.length]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>My Orders</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {ORDER_FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === item.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : orderCount === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-500 mb-6">You have not placed any orders yet.</p>
            <Link to="/products">
              <button className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors text-sm">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Order</p>
                    <p className="font-semibold text-slate-900">{order.orderNumber || order.id}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="font-bold text-slate-900">{formatCurrency(order.total || 0)}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                      {(order.status || 'PENDING').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <Link to={`/orders/${order.id}`}>
                    <button className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors flex items-center gap-2">
                      View Details <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
