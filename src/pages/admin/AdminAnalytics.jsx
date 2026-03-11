import { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, storage } from '../../utils';
import { analyticsAPI } from '../../services/api';
import { useAuthStore } from '../../store';

const AdminAnalytics = () => {
  const { user } = useAuthStore();
  const persistedUser = storage.get('user');
  const storeId = user?.storeId || persistedUser?.storeId || storage.get('storeId');
  const analyticsStoreId = storeId || 'current';

  const [period, setPeriod] = useState('30d');
  const [summary, setSummary] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [ordersSeries, setOrdersSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, conversionRes, revenueRes, ordersRes, topProductsRes] = await Promise.all([
          analyticsAPI.getDashboardStats(analyticsStoreId, period),
          analyticsAPI.getConversionRate(analyticsStoreId, period),
          analyticsAPI.getRevenueChart(analyticsStoreId, period),
          analyticsAPI.getOrdersChart(analyticsStoreId, period),
          analyticsAPI.getTopProducts(analyticsStoreId, 6, period),
        ]);

        setSummary(summaryRes?.data?.data || null);
        setConversion(conversionRes?.data?.data || null);
        setRevenueSeries(revenueRes?.data?.data || []);
        setOrdersSeries(ordersRes?.data?.data || []);
        setTopProducts(topProductsRes?.data?.data || []);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setSummary(null);
        setConversion(null);
        setRevenueSeries([]);
        setOrdersSeries([]);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [analyticsStoreId, period]);

  const cards = useMemo(() => {
    const growth = Number(summary?.revenue?.growth || 0);
    return [
      { label: 'Revenue', value: formatCurrency(summary?.revenue?.total || 0), change: `${Math.abs(growth)}%`, up: growth >= 0, icon: DollarSign },
      { label: 'Orders', value: String(summary?.orders?.total || 0), change: `${conversion?.orders || 0} checked out`, up: true, icon: ShoppingCart },
      { label: 'Customers', value: String(summary?.customers?.total || 0), change: `${conversion?.visitors || 0} visitors`, up: true, icon: Users },
      { label: 'Conversion', value: `${conversion?.conversionRate || 0}%`, change: period, up: true, icon: TrendingUp },
    ];
  }, [summary, conversion, period]);

  const topProductsPie = useMemo(() => {
    const total = topProducts.reduce((sum, p) => sum + (Number(p.totalRevenue) || 0), 0);
    return topProducts.slice(0, 5).map((p, index) => ({
      name: p.name,
      value: total > 0 ? Math.round(((Number(p.totalRevenue) || 0) / total) * 100) : 0,
      color: ['#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ec4899'][index],
    }));
  }, [topProducts]);

  const orderRevenueInsights = useMemo(() => {
    const totalRevenue = revenueSeries.reduce((sum, row) => sum + (Number(row.revenue) || 0), 0);
    const paidOrders = revenueSeries.reduce((sum, row) => sum + (Number(row.orders) || 0), 0);
    const totalOrders = ordersSeries.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
    const delivered = ordersSeries.reduce((sum, row) => sum + (Number(row.delivered) || 0), 0);
    const cancelled = ordersSeries.reduce((sum, row) => sum + (Number(row.cancelled) || 0), 0);
    const days = revenueSeries.length || 1;

    return {
      avgDailyRevenue: totalRevenue / days,
      paidOrderAov: paidOrders > 0 ? totalRevenue / paidOrders : 0,
      cancellationRate: totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0,
      deliveryRate: totalOrders > 0 ? (delivered / totalOrders) * 100 : 0,
    };
  }, [revenueSeries, ordersSeries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Live analytics from your backend data</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <card.icon className="h-5 w-5 text-slate-700" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {card.change}
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Avg Daily Revenue</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(orderRevenueInsights.avgDailyRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Earned Order AOV</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(orderRevenueInsights.paidOrderAov)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500 mb-1">Delivery / Cancellation Rate</p>
          <p className="text-xl font-bold text-slate-900">
            {orderRevenueInsights.deliveryRate.toFixed(1)}% / {orderRevenueInsights.cancellationRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                formatter={(value) => [formatCurrency(Number(value) || 0), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top Product Revenue Share</h3>
          {topProductsPie.length === 0 ? (
            <p className="text-sm text-slate-500">No product revenue data.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={topProductsPie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">
                    {topProductsPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {topProductsPie.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-medium text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Order Status Trend</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Delivered</th>
                <th className="py-3 pr-4">Cancelled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordersSeries.slice(-15).map((row) => (
                <tr key={row.date}>
                  <td className="py-3 pr-4 text-slate-600">{String(row.date).slice(0, 10)}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">{row.total}</td>
                  <td className="py-3 pr-4 text-emerald-600">{row.delivered}</td>
                  <td className="py-3 pr-4 text-rose-600">{row.cancelled}</td>
                </tr>
              ))}
              {ordersSeries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No order trend data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
