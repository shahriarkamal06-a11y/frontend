import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign, TrendingUp,
  ArrowUpRight, BarChart3, Eye, Edit, Plus, Store, Settings
} from 'lucide-react';
import { formatCurrency } from '../../utils';
import PRODUCTS from '../../data/products';

export const VendorDashboard = () => {
  const stats = [
    { label: 'Total Earnings', value: '$12,450', change: '+14.2%', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Orders', value: '256', change: '+9.8%', icon: ShoppingCart, color: 'from-violet-500 to-indigo-500' },
    { label: 'Products Listed', value: '32', change: '+3', icon: Package, color: 'from-amber-500 to-orange-500' },
    { label: 'Commission Rate', value: '15%', change: 'Fixed', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  ];

  const recentOrders = [
    { id: 'ORD-V001', product: 'Wireless Headphones', customer: 'Sarah M.', amount: 299.99, commission: 45.00, status: 'Completed', date: '2026-03-01' },
    { id: 'ORD-V002', product: 'Bluetooth Speaker', customer: 'James W.', amount: 79.99, commission: 12.00, status: 'Processing', date: '2026-03-01' },
    { id: 'ORD-V003', product: 'Smart Home Hub', customer: 'Emily C.', amount: 129.99, commission: 19.50, status: 'Shipped', date: '2026-02-28' },
  ];

  const statusColors = {
    Completed: 'badge-success', Processing: 'badge-warning', Shipped: 'badge-info',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Vendor Dashboard</h1>
            <p className="text-violet-200 text-sm mt-1">Welcome back! Here's your store overview</p>
          </div>
          <div className="flex gap-2">
            <Link to="/vendor/products">
              <button className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2">
                <Package className="h-4 w-4" /> My Products
              </button>
            </Link>
            <Link to="/">
              <button className="px-4 py-2 bg-white text-violet-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
                <Eye className="h-4 w-4" /> View Store
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" /> {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-slate-900 mb-6">Earnings Overview</h3>
          <div className="flex items-end gap-3 h-40">
            {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-slate-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Recent Orders</h3>
            <Link to="/vendor/orders" className="text-sm text-violet-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 pr-4">Order</th><th className="pb-3 pr-4">Product</th><th className="pb-3 pr-4">Amount</th><th className="pb-3 pr-4">Commission</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3 pr-4 font-medium text-slate-900">{order.id}</td>
                    <td className="py-3 pr-4 text-slate-600">{order.product}</td>
                    <td className="py-3 pr-4 font-medium text-slate-900">{formatCurrency(order.amount)}</td>
                    <td className="py-3 pr-4 text-emerald-600 font-medium">{formatCurrency(order.commission)}</td>
                    <td className="py-3 pr-4"><span className={`badge ${statusColors[order.status]}`}>{order.status}</span></td>
                    <td className="py-3 text-slate-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VendorProducts = () => {
  const vendorProducts = PRODUCTS.slice(0, 10);
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>My Products</h1>
        <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendorProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover-card">
            <img src={product.images[0]} alt="" className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">{product.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{formatCurrency(product.price)}</span>
                <span className={`badge ${product.stock > 20 ? 'badge-success' : 'badge-warning'}`}>{product.stock} in stock</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button className="flex-1 py-2 text-sm text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors flex items-center justify-center gap-1">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button className="flex-1 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VendorOrders = () => {
  const orders = [
    { id: 'VO-001', product: 'Premium Headphones', customer: 'Sarah M.', amount: 299.99, commission: 45.00, status: 'Completed', date: '2026-03-01' },
    { id: 'VO-002', product: 'Bluetooth Speaker', customer: 'James W.', amount: 79.99, commission: 12.00, status: 'Processing', date: '2026-03-01' },
    { id: 'VO-003', product: 'Fitness Tracker', customer: 'Emily C.', amount: 149.99, commission: 22.50, status: 'Shipped', date: '2026-02-28' },
    { id: 'VO-004', product: 'Smart Home Hub', customer: 'Mike B.', amount: 129.99, commission: 19.50, status: 'Completed', date: '2026-02-27' },
  ];
  const statusColors = { Completed: 'badge-success', Processing: 'badge-warning', Shipped: 'badge-info' };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>My Orders</h1>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-3">Order</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Commission</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50 text-sm">
                  <td className="px-6 py-4 font-medium text-slate-900">{o.id}</td>
                  <td className="px-6 py-4 text-slate-600">{o.product}</td>
                  <td className="px-6 py-4 text-slate-600">{o.customer}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(o.amount)}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(o.commission)}</td>
                  <td className="px-6 py-4"><span className={`badge ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="px-6 py-4 text-slate-500">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};