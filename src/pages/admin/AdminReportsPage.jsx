import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { analyticsAPI, orderAPI, productAPI, userAPI } from '../../services/api';
import { formatCurrency, storage } from '../../utils';
import { useAuthStore } from '../../store';
import { normalizeProduct } from '../../hooks/useApi';

const PERIOD_TO_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const MAX_PAGES = 50;

async function fetchAllPages(fetcher, baseParams = {}) {
  let page = 1;
  let totalPages = 1;
  const allItems = [];

  while (page <= totalPages && page <= MAX_PAGES) {
    const response = await fetcher({
      ...baseParams,
      page: String(page),
      limit: '100',
    });
    const items = response?.data?.data?.items || [];
    const pagination = response?.data?.data?.pagination || {};

    allItems.push(...items);
    totalPages = Number(pagination.totalPages || 1);
    page += 1;
  }

  return allItems;
}

const AdminReportsPage = () => {
  const { user } = useAuthStore();
  const persistedUser = storage.get('user');
  const storeId = user?.storeId || persistedUser?.storeId || storage.get('storeId');
  const analyticsStoreId = storeId || 'current';

  const [selectedReport, setSelectedReport] = useState('sales');
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [
          summaryRes,
          revenueRes,
          topProductsRes,
          allOrders,
          allProducts,
          allCustomers,
        ] = await Promise.all([
          analyticsAPI.getDashboardStats(analyticsStoreId, period),
          analyticsAPI.getRevenueChart(analyticsStoreId, period),
          analyticsAPI.getTopProducts(analyticsStoreId, 10, period),
          fetchAllPages(orderAPI.getOrders, { sort: 'created-desc' }),
          fetchAllPages(productAPI.getProducts),
          fetchAllPages(userAPI.getUsers, { role: 'CUSTOMER' }),
        ]);

        setSummary(summaryRes?.data?.data || null);
        setRevenueSeries(revenueRes?.data?.data || []);
        setTopProducts(topProductsRes?.data?.data || []);
        setOrders(allOrders || []);
        setProducts((allProducts || []).map(normalizeProduct).filter(Boolean));
        setCustomers(allCustomers || []);
      } catch (error) {
        console.error('Failed to load reports:', error);
        setSummary(null);
        setRevenueSeries([]);
        setTopProducts([]);
        setOrders([]);
        setProducts([]);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [period, analyticsStoreId]);

  const reportStats = useMemo(() => {
    const days = PERIOD_TO_DAYS[period] || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const ordersInPeriod = orders.filter((order) => order.createdAt && new Date(order.createdAt) >= since);
    const paidOrdersInPeriod = ordersInPeriod.filter((order) => order.paymentStatus === 'PAID');
    const cancelledOrdersInPeriod = ordersInPeriod.filter((order) => order.status === 'CANCELLED');

    const revenueTotal = Number(summary?.revenue?.total || 0);
    const orderTotal = Number(summary?.orders?.total || ordersInPeriod.length || 0);
    const paidOrdersCount = revenueSeries.reduce((sum, row) => sum + (Number(row.orders) || 0), 0);
    const averageOrderValue = paidOrdersCount > 0 ? revenueTotal / paidOrdersCount : 0;
    const cancellationRate = orderTotal > 0 ? (cancelledOrdersInPeriod.length / orderTotal) * 100 : 0;

    const activeProducts = products.filter((product) => product.isActive !== false);
    const outOfStockProducts = products.filter((product) => Number(product.stock ?? product.quantity ?? 0) <= 0);
    const lowStockProducts = products.filter((product) => {
      const qty = Number(product.stock ?? product.quantity ?? 0);
      const threshold = Number(product.lowStockThreshold || 5);
      return qty > 0 && qty <= threshold;
    });

    const customerOrderMap = new Map();
    const customerSpendMap = new Map();
    for (const order of orders) {
      if (!order.userId) continue;
      customerOrderMap.set(order.userId, (customerOrderMap.get(order.userId) || 0) + 1);
      customerSpendMap.set(order.userId, (customerSpendMap.get(order.userId) || 0) + (Number(order.total) || 0));
    }

    const activeCustomerIds = new Set(ordersInPeriod.map((order) => order.userId).filter(Boolean));
    const returningCustomers = Array.from(customerOrderMap.values()).filter((count) => count >= 2).length;
    const customersInPeriod = customers.filter((customer) => customer.createdAt && new Date(customer.createdAt) >= since);
    const avgLifetimeValue = customerSpendMap.size > 0
      ? (Array.from(customerSpendMap.values()).reduce((sum, value) => sum + value, 0) / customerSpendMap.size)
      : 0;

    const topCustomerRows = customers
      .map((customer) => ({
        ...customer,
        orders: customerOrderMap.get(customer.id) || 0,
        spent: customerSpendMap.get(customer.id) || 0,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 12);

    return {
      sales: {
        revenueTotal,
        orderTotal,
        averageOrderValue,
        revenueGrowth: Number(summary?.revenue?.growth || 0),
        cancellationRate,
        paidOrdersCount,
        paidOrdersInPeriod: paidOrdersInPeriod.length,
      },
      products: {
        total: products.length,
        active: activeProducts.length,
        outOfStock: outOfStockProducts.length,
        lowStock: lowStockProducts.length,
        topPerforming: topProducts.length,
      },
      customers: {
        total: customers.length,
        newInPeriod: customersInPeriod.length,
        active: activeCustomerIds.size,
        returning: returningCustomers,
        averageLifetimeValue: avgLifetimeValue,
      },
      topCustomers: topCustomerRows,
    };
  }, [period, summary, revenueSeries, orders, products, customers, topProducts]);

  const reports = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
    { id: 'products', name: 'Products Report', icon: Package, color: 'from-violet-500 to-indigo-500' },
    { id: 'customers', name: 'Customers Report', icon: Users, color: 'from-blue-500 to-cyan-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Reports
              </h1>
              <p className="text-slate-600">Live reporting from orders, revenue, products, and customer data</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedReport === report.id
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center mb-3`}>
                  <report.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-slate-900">{report.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {selectedReport === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="Revenue"
                value={formatCurrency(reportStats.sales.revenueTotal)}
                change={`${Math.abs(reportStats.sales.revenueGrowth).toFixed(1)}%`}
                positive={reportStats.sales.revenueGrowth >= 0}
                icon={DollarSign}
              />
              <SummaryCard
                label="Orders"
                value={String(reportStats.sales.orderTotal)}
                change={`${reportStats.sales.paidOrdersCount} earned`}
                positive
                icon={ShoppingCart}
              />
              <SummaryCard
                label="Avg Order Value"
                value={formatCurrency(reportStats.sales.averageOrderValue)}
                change={`${reportStats.sales.paidOrdersInPeriod} earned in period`}
                positive
                icon={BarChart3}
              />
              <SummaryCard
                label="Cancellation Rate"
                value={`${reportStats.sales.cancellationRate.toFixed(1)}%`}
                change={reportStats.sales.cancellationRate > 10 ? 'High' : 'Healthy'}
                positive={reportStats.sales.cancellationRate <= 10}
                icon={Users}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue by Day (Earned Orders)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Revenue</th>
                      <th className="pb-3">Earned Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {revenueSeries.slice(-20).map((row) => (
                      <tr key={row.date} className="text-sm">
                        <td className="py-3 pr-4 text-slate-700">{String(row.date).slice(0, 10)}</td>
                        <td className="py-3 pr-4 font-medium text-slate-900">{formatCurrency(Number(row.revenue) || 0)}</td>
                        <td className="py-3 text-slate-700">{row.orders}</td>
                      </tr>
                    ))}
                    {revenueSeries.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-500">No revenue data for this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Products by Earned Revenue</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4">Revenue</th>
                      <th className="pb-3">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.map((product) => (
                      <tr key={product.id} className="text-sm">
                        <td className="py-3 pr-4 font-medium text-slate-900">{product.name}</td>
                        <td className="py-3 pr-4 text-slate-700">{formatCurrency(Number(product.totalRevenue) || 0)}</td>
                        <td className="py-3 text-slate-700">{product.soldCount || 0}</td>
                      </tr>
                    ))}
                    {topProducts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-500">No product revenue data for this period.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'products' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SimpleStat label="Total Products" value={reportStats.products.total} />
              <SimpleStat label="Active Products" value={reportStats.products.active} />
              <SimpleStat label="Out of Stock" value={reportStats.products.outOfStock} />
              <SimpleStat label="Low Stock" value={reportStats.products.lowStock} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Inventory Snapshot</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3 pr-4">Stock</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.slice(0, 20).map((product) => {
                      const qty = Number(product.stock ?? product.quantity ?? 0);
                      const threshold = Number(product.lowStockThreshold || 5);
                      const status = qty <= 0 ? 'Out' : (qty <= threshold ? 'Low' : 'Healthy');
                      return (
                        <tr key={product.id} className="text-sm">
                          <td className="py-3 pr-4 font-medium text-slate-900">{product.name}</td>
                          <td className="py-3 pr-4 text-slate-700">{formatCurrency(Number(product.price) || 0)}</td>
                          <td className="py-3 pr-4 text-slate-700">{qty}</td>
                          <td className="py-3 text-slate-700">{status}</td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-500">No products available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SimpleStat label="Total Customers" value={reportStats.customers.total} />
              <SimpleStat label={`New (${period})`} value={reportStats.customers.newInPeriod} />
              <SimpleStat label="Active in Period" value={reportStats.customers.active} />
              <SimpleStat label="Avg Lifetime Value" value={formatCurrency(reportStats.customers.averageLifetimeValue)} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Customers by Spend</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Orders</th>
                      <th className="pb-3">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportStats.topCustomers.map((customer) => (
                      <tr key={customer.id} className="text-sm">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">{customer.firstName} {customer.lastName}</p>
                          <p className="text-slate-500">{customer.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{customer.orders}</td>
                        <td className="py-3 font-medium text-slate-900">{formatCurrency(customer.spent)}</td>
                      </tr>
                    ))}
                    {reportStats.topCustomers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-500">No customer order data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, change, positive, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-slate-600">{label}</span>
      <Icon className="h-4 w-4 text-slate-500" />
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {change}
    </div>
  </div>
);

const SimpleStat = ({ label, value }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-6">
    <p className="text-sm text-slate-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export default AdminReportsPage;
