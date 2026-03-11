import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const VendorAnalytics = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { label: 'Total Earnings', value: 32450, change: 18.5, trend: 'up', icon: DollarSign, color: 'emerald' },
    { label: 'Total Orders', value: 486, change: 12.3, trend: 'up', icon: ShoppingBag, color: 'violet' },
    { label: 'Products Sold', value: 1243, change: 8.7, trend: 'up', icon: Package, color: 'blue' },
    { label: 'Conversion Rate', value: '3.2%', change: -0.5, trend: 'down', icon: Target, color: 'amber' }
  ];

  const earningsData = [
    { date: 'Mar 1', earnings: 850, orders: 12 },
    { date: 'Mar 2', earnings: 1200, orders: 18 },
    { date: 'Mar 3', earnings: 950, orders: 14 },
    { date: 'Mar 4', earnings: 1400, orders: 21 },
    { date: 'Mar 5', earnings: 1100, orders: 16 },
    { date: 'Mar 6', earnings: 1650, orders: 24 },
    { date: 'Mar 7', earnings: 1300, orders: 19 },
    { date: 'Mar 8', earnings: 1800, orders: 27 },
    { date: 'Mar 9', earnings: 1450, orders: 22 },
    { date: 'Mar 10', earnings: 2100, orders: 31 },
    { date: 'Mar 11', earnings: 1750, orders: 25 },
    { date: 'Mar 12', earnings: 2300, orders: 34 },
    { date: 'Mar 13', earnings: 1950, orders: 28 },
    { date: 'Mar 14', earnings: 2500, orders: 37 }
  ];

  const topProducts = [
    { name: 'Wireless Headphones Pro', sales: 89, revenue: 26611, views: 1250 },
    { name: 'Smart Watch Series 5', sales: 67, revenue: 26733, views: 980 },
    { name: 'Bluetooth Speaker X1', sales: 54, revenue: 4314, views: 750 },
    { name: 'Phone Case Premium', sales: 156, revenue: 3894, views: 2100 },
    { name: 'USB-C Cable 3-pack', sales: 203, revenue: 3045, views: 1800 }
  ];

  const categorySales = [
    { name: 'Electronics', value: 45, color: '#3b82f6' },
    { name: 'Accessories', value: 30, color: '#ec4899' },
    { name: 'Audio', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 10, color: '#10b981' }
  ];

  const trafficSources = [
    { source: 'Direct', visitors: 2840, percentage: 42 },
    { source: 'Marketplace Search', visitors: 1980, percentage: 29 },
    { source: 'Social Media', visitors: 1220, percentage: 18 },
    { source: 'External', visitors: 750, percentage: 11 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-8">
        <div className="px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Vendor Analytics</h1>
              <p className="text-violet-200 text-sm mt-1">Track your store performance</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white outline-none"
              >
                <option value="7d" className="text-slate-900">Last 7 days</option>
                <option value="30d" className="text-slate-900">Last 30 days</option>
                <option value="90d" className="text-slate-900">Last 90 days</option>
                <option value="1y" className="text-slate-900">Last year</option>
              </select>
              <button className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white hover:bg-white/20 transition-all flex items-center gap-2">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-8 w-fit">
          {['overview', 'sales', 'products', 'customers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-${stat.color}-50 rounded-xl`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stat.label.includes('Earnings') 
                  ? formatCurrency(stat.value) 
                  : stat.label.includes('Rate')
                    ? stat.value
                    : stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Earnings Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Earnings & Orders</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-violet-500" />
                      Earnings
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      Orders
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      formatter={(value) => [formatCurrency(value), 'Earnings']}
                    />
                    <Area type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                    <Line type="monotone" dataKey="orders" stroke="#34d399" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Category */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-6">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categorySales}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categorySales.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="font-medium text-slate-900">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Top Selling Products</h3>
                <button className="text-sm text-violet-600 hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Sales</th>
                      <th className="pb-3">Revenue</th>
                      <th className="pb-3">Views</th>
                      <th className="pb-3">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.map((product, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-4">
                          <p className="font-medium text-slate-900">{product.name}</p>
                        </td>
                        <td className="py-4 text-slate-900">{product.sales}</td>
                        <td className="py-4 text-slate-900">{formatCurrency(product.revenue)}</td>
                        <td className="py-4 text-slate-600">{product.views.toLocaleString()}</td>
                        <td className="py-4">
                          <span className="text-emerald-600 font-medium">
                            {((product.sales / product.views) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-6">Traffic Sources</h3>
                <div className="space-y-4">
                  {trafficSources.map((source, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-700">{source.source}</span>
                        <span className="text-sm font-medium text-slate-900">{source.visitors.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${source.percentage}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="h-full bg-violet-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-6">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900">4.8%</p>
                    <p className="text-sm text-slate-500 mt-1">Click-through Rate</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900">2.3%</p>
                    <p className="text-sm text-slate-500 mt-1">Add to Cart Rate</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900">68%</p>
                    <p className="text-sm text-slate-500 mt-1">Checkout Completion</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-2xl font-bold text-slate-900">4.5★</p>
                    <p className="text-sm text-slate-500 mt-1">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-6">Sales Breakdown</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorAnalytics;
