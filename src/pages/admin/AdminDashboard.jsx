import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';
import { formatCurrency, storage } from '../../utils';
import { analyticsAPI, orderAPI } from '../../services/api';
import { useAuthStore } from '../../store';

const metricPalette = {
  revenue: {
    icon: DollarSign,
    iconClass: 'bg-slate-900 text-white',
    accentClass: 'text-emerald-600',
  },
  orders: {
    icon: ShoppingCart,
    iconClass: 'bg-blue-600/10 text-blue-700',
    accentClass: 'text-blue-700',
  },
  customers: {
    icon: Users,
    iconClass: 'bg-indigo-600/10 text-indigo-700',
    accentClass: 'text-indigo-700',
  },
  conversion: {
    icon: TrendingUp,
    iconClass: 'bg-cyan-600/10 text-cyan-700',
    accentClass: 'text-cyan-700',
  },
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const persistedUser = storage.get('user');
  const storeId = user?.storeId || persistedUser?.storeId || storage.get('storeId');
  const analyticsStoreId = storeId || 'current';

  const [summary, setSummary] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [dashRes, conversionRes, revenueRes, ordersRes, topRes] = await Promise.allSettled([
          analyticsAPI.getDashboardStats(analyticsStoreId),
          analyticsAPI.getConversionRate(analyticsStoreId),
          analyticsAPI.getRevenueChart(analyticsStoreId, '30d'),
          orderAPI.getOrders({ limit: '6', sort: 'created-desc' }),
          analyticsAPI.getTopProducts(analyticsStoreId, 5),
        ]);

        if (dashRes.status === 'fulfilled') {
          setSummary(dashRes.value?.data?.data || null);
        }
        if (conversionRes.status === 'fulfilled') {
          setConversion(conversionRes.value?.data?.data || null);
        }
        if (revenueRes.status === 'fulfilled') {
          setRevenueSeries(revenueRes.value?.data?.data || []);
        }
        if (ordersRes.status === 'fulfilled') {
          setRecentOrders(ordersRes.value?.data?.data?.items || []);
        }
        if (topRes.status === 'fulfilled') {
          setTopProducts(topRes.value?.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [analyticsStoreId]);

  const revenueGrowth = Number(summary?.revenue?.growth || 0);

  const metrics = useMemo(
    () => [
      {
        key: 'revenue',
        label: 'Gross Revenue',
        value: formatCurrency(summary?.revenue?.total || 0),
        helper: `${Math.abs(revenueGrowth)}% vs previous period`,
        up: revenueGrowth >= 0,
      },
      {
        key: 'orders',
        label: 'Total Orders',
        value: String(summary?.orders?.total || 0),
        helper: `${summary?.orders?.byStatus?.PENDING || 0} pending fulfillment`,
        up: true,
      },
      {
        key: 'customers',
        label: 'Active Customers',
        value: String(summary?.customers?.total || 0),
        helper: 'Customers who placed at least one order',
        up: true,
      },
      {
        key: 'conversion',
        label: 'Conversion Rate',
        value: `${conversion?.conversionRate || 0}%`,
        helper: `${conversion?.orders || 0} converted checkouts`,
        up: true,
      },
    ],
    [conversion, summary, revenueGrowth]
  );

  const recentRevenue = revenueSeries.slice(-14);
  const maxRevenue = Math.max(...recentRevenue.map((entry) => Number(entry.revenue || 0)), 1);

  const ordersByStatus = summary?.orders?.byStatus || {};

  const statusRows = [
    { label: 'Pending', value: ordersByStatus.PENDING || 0 },
    { label: 'Processing', value: ordersByStatus.PROCESSING || 0 },
    { label: 'Shipped', value: ordersByStatus.SHIPPED || 0 },
    { label: 'Delivered', value: ordersByStatus.DELIVERED || 0 },
    { label: 'Cancelled', value: ordersByStatus.CANCELLED || 0 },
  ];

  const orderTotal = Number(summary?.orders?.total || 0);

  if (loading) {
    return (
      <div className="admin-panel min-h-[360px] flex items-center justify-center">
        <div className="text-center">
          <div className="h-11 w-11 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-panel p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Store Performance</p>
            <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 leading-tight">
              Revenue is {revenueGrowth >= 0 ? 'trending up' : 'under pressure'} this period
            </h2>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Keep fulfillment speed high and review top products to sustain conversion momentum.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/admin/products/new" className="admin-primary-btn text-sm px-4 py-2.5 pt-2.5 pb-2.5">
              Add Product
            </Link>
            <Link to="/admin/reports" className="admin-secondary-btn text-sm px-4 py-2.5 inline-flex items-center gap-1.5">
              View Reports <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const palette = metricPalette[metric.key];
          const DirectionIcon = metric.up ? ArrowUpRight : ArrowDownRight;

          return (
            <article key={metric.key} className="admin-panel p-5 hover-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${palette.iconClass}`}>
                  <palette.icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${palette.accentClass}`}>
                  <DirectionIcon className="h-3.5 w-3.5" />
                  {metric.key === 'revenue' ? `${Math.abs(revenueGrowth)}%` : 'Live'}
                </span>
              </div>

              <p className="text-2xl font-semibold text-slate-900 tracking-tight">{metric.value}</p>
              <p className="text-sm font-medium text-slate-600 mt-1">{metric.label}</p>
              <p className="text-xs text-slate-400 mt-2">{metric.helper}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <article className="admin-panel p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
              <p className="text-sm text-slate-500">Last 14 days</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Dynamic from analytics API
            </div>
          </div>

          {recentRevenue.length === 0 ? (
            <p className="text-sm text-slate-500">No revenue data available for this period.</p>
          ) : (
            <div className="h-60 flex items-end gap-2 sm:gap-3">
              {recentRevenue.map((point) => {
                const value = Number(point.revenue || 0);
                const height = Math.max(8, Math.round((value / maxRevenue) * 100));

                return (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <div
                      className="w-full rounded-t-xl rounded-b-md bg-gradient-to-t from-slate-900 via-slate-700 to-slate-500"
                      style={{ height: `${height}%` }}
                      title={`${formatCurrency(value)} on ${point.date}`}
                    />
                    <span className="text-[10px] text-slate-400 truncate">{String(point.date).slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="admin-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Fulfillment Health</h3>
              <p className="text-sm text-slate-500">Order distribution</p>
            </div>
            <Clock3 className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {statusRows.map((row) => {
              const percentage = orderTotal > 0 ? Math.round((row.value / orderTotal) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-medium text-slate-800">{row.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${Math.max(percentage, row.value > 0 ? 6 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="admin-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Top Products</h3>
            <Link to="/admin/products" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
              Manage <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No top products available.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.soldCount || 0} units sold</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-3 py-1.5">
                    {formatCurrency(Number(product.totalRevenue || 0))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="admin-panel p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-5 min-w-[560px]">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 min-w-[560px]">No recent orders found.</p>
          ) : (
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3 pr-4 font-medium text-slate-900">{order.orderNumber || order.id}</td>
                    <td className="py-3 pr-4 text-slate-600 truncate max-w-48">
                      {order.customerName || order.customerEmail || 'Customer'}
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900">{formatCurrency(order.total || 0)}</td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-slate-100 text-slate-700">
                        {String(order.status || 'PENDING').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{order.createdAt ? String(order.createdAt).slice(0, 10) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </section>

      {summary?.orders?.byStatus && (
        <section className="admin-panel p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Operational Snapshot</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(summary.orders.byStatus).map(([status, count]) => (
              <div key={status} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{status}</p>
                <p className="text-xl font-semibold text-slate-900 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
