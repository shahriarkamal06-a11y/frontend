import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils';
import { orderAPI, productAPI, userAPI } from '../../services/api';
import { normalizeProduct } from '../../hooks/useApi';


// SVGImageElement
// thisn is veray bad 

export const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productAPI.getProducts({ limit: '30', page: '1', search: searchQuery || undefined });
        const items = response?.data?.data?.items || [];
        setProducts(items.map(normalizeProduct).filter(Boolean));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Products</h1>
        <Link to="/admin/products/new" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl text-sm">
          Add Product
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-4 py-3">Product</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No products found</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]?.url || product.images?.[0] || ''} alt="" className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                      <div><p className="text-sm font-medium text-slate-900 truncate max-w-48">{product.name}</p><p className="text-xs text-slate-400">{product.sku}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(Number(product.price) || 0)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.stock ?? product.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.isActive === false ? 'Inactive' : 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const params = { limit: '50', page: '1' };
        if (statusFilter !== 'all') params.status = statusFilter;
        const response = await orderAPI.getOrders(params);
        const loadedOrders = response?.data?.data?.items || [];
        setOrders(loadedOrders);
        setStatusDrafts(
          loadedOrders.reduce((acc, order) => {
            acc[order.id] = String(order.status || 'PENDING').toUpperCase();
            return acc;
          }, {})
        );
      } catch {
        toast.error('Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [statusFilter]);

  const statuses = ['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  const handleUpdateStatus = async (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    const nextStatus = statusDrafts[orderId];
    const currentStatus = String(order.status || 'PENDING').toUpperCase();
    if (!nextStatus || nextStatus === currentStatus) return;

    setUpdatingOrderId(orderId);
    try {
      await orderAPI.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((item) => (
        item.id === orderId ? { ...item, status: nextStatus } : item
      )));
      toast.success('Order status updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
      setStatusDrafts((prev) => ({ ...prev, [orderId]: currentStatus }));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>Orders</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${statusFilter === status ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-3">Order ID</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.orderNumber || order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{order.customerName || 'Customer'}</p>
                    <p className="text-xs text-slate-400">{order.customerEmail || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(order.total || 0)}</td>
                  <td className="px-6 py-4"><span className="badge bg-slate-100 text-slate-700">{String(order.status || 'PENDING').replace(/_/g, ' ')}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{order.createdAt ? String(order.createdAt).slice(0, 10) : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={statusDrafts[order.id] || String(order.status || 'PENDING').toUpperCase()}
                        onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                        disabled={updatingOrderId === order.id}
                      >
                        {statuses.filter((status) => status !== 'all').map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id)}
                        disabled={
                          updatingOrderId === order.id
                          || (statusDrafts[order.id] || String(order.status || 'PENDING').toUpperCase()) === String(order.status || 'PENDING').toUpperCase()
                        }
                        className="px-2.5 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingOrderId === order.id ? 'Saving...' : 'Update'}
                      </button>
                      <Link to={`/orders/${order.id}`} className="p-1.5 inline-flex text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersRes, ordersRes] = await Promise.all([
          userAPI.getUsers({ role: 'CUSTOMER', limit: '100', page: '1', search: searchQuery || undefined }),
          orderAPI.getOrders({ limit: '200', page: '1' }),
        ]);

        setCustomers(usersRes?.data?.data?.items || []);
        setOrders(ordersRes?.data?.data?.items || []);
      } catch {
        setCustomers([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery]);

  const aggregates = useMemo(() => {
    const map = new Map();
    for (const order of orders) {
      const key = order.userId;
      if (!key) continue;
      const current = map.get(key) || { orders: 0, spent: 0 };
      current.orders += 1;
      current.spent += Number(order.total) || 0;
      map.set(key, current);
    }
    return map;
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Customers</h1>
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
        />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-3">Customer</th><th className="px-6 py-3">Orders</th><th className="px-6 py-3">Total Spent</th><th className="px-6 py-3">Joined</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No customers found</td></tr>
              ) : customers.map((customer) => {
                const stats = aggregates.get(customer.id) || { orders: 0, spent: 0 };
                const initials = `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase() || 'CU';

                return (
                  <tr key={customer.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-slate-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{stats.orders}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(stats.spent)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{customer.createdAt ? String(customer.createdAt).slice(0, 10) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
