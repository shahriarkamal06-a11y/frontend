import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Package, DollarSign, User, Calendar, Eye, Download, RefreshCw, CheckCircle, Clock, Truck, XCircle, MoreVertical } from 'lucide-react';
import { formatCurrency } from '../../utils';

const VendorOrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30days');

  const orders = [
    {
      id: 'VO-001',
      customer: { name: 'Sarah Mitchell', email: 'sarah.m@email.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
      items: [
        { name: 'Premium Wireless Headphones', quantity: 1, price: 299.99, sku: 'VENDOR-0001' }
      ],
      total: 299.99,
      commission: 45.00,
      commissionRate: 15,
      status: 'completed',
      date: '2026-03-01',
      trackingNumber: 'TRK123456789',
      paymentMethod: 'Credit Card',
      shippingAddress: '123 Main St, New York, NY 10001'
    },
    {
      id: 'VO-002',
      customer: { name: 'James Wilson', email: 'james.w@email.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
      items: [
        { name: 'Bluetooth Speaker', quantity: 2, price: 79.99, sku: 'VENDOR-0002' }
      ],
      total: 159.98,
      commission: 24.00,
      commissionRate: 15,
      status: 'processing',
      date: '2026-03-01',
      trackingNumber: null,
      paymentMethod: 'PayPal',
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90001'
    },
    {
      id: 'VO-003',
      customer: { name: 'Emily Chen', email: 'emily.c@email.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
      items: [
        { name: 'Smart Watch Pro', quantity: 1, price: 399.99, sku: 'VENDOR-0003' },
        { name: 'Phone Case', quantity: 2, price: 29.99, sku: 'VENDOR-0004' }
      ],
      total: 459.97,
      commission: 68.99,
      commissionRate: 15,
      status: 'shipped',
      date: '2026-02-28',
      trackingNumber: 'TRK987654321',
      paymentMethod: 'Credit Card',
      shippingAddress: '789 Pine St, Chicago, IL 60601'
    },
    {
      id: 'VO-004',
      customer: { name: 'Michael Brown', email: 'michael.b@email.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
      items: [
        { name: 'Laptop Stand', quantity: 1, price: 89.99, sku: 'VENDOR-0005' }
      ],
      total: 89.99,
      commission: 13.50,
      commissionRate: 15,
      status: 'pending',
      date: '2026-02-27',
      trackingNumber: null,
      paymentMethod: 'Bank Transfer',
      shippingAddress: '321 Elm St, Houston, TX 77001'
    },
    {
      id: 'VO-005',
      customer: { name: 'Lisa Anderson', email: 'lisa.a@email.com', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face' },
      items: [
        { name: 'Wireless Mouse', quantity: 1, price: 49.99, sku: 'VENDOR-0006' }
      ],
      total: 49.99,
      commission: 7.50,
      commissionRate: 15,
      status: 'cancelled',
      date: '2026-02-26',
      trackingNumber: null,
      paymentMethod: 'Credit Card',
      shippingAddress: '654 Maple Dr, Phoenix, AZ 85001'
    }
  ];

  const statusConfig = {
    pending: { color: 'bg-amber-50 text-amber-700', icon: Clock, label: 'Pending' },
    processing: { color: 'bg-blue-50 text-blue-700', icon: RefreshCw, label: 'Processing' },
    shipped: { color: 'bg-violet-50 text-violet-700', icon: Package, label: 'Shipped' },
    completed: { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Completed' },
    cancelled: { color: 'bg-rose-50 text-rose-700', icon: XCircle, label: 'Cancelled' },
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.commission, 0);
  const pendingOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                My Orders
              </h1>
              <p className="text-slate-600">Manage customer orders and track shipments</p>
            </div>
            <button className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Orders
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Orders</span>
                <Package className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              <p className="text-sm text-slate-500">All time</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Pending</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{pendingOrders}</p>
              <p className="text-sm text-amber-600">Need action</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Completed</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{completedOrders}</p>
              <p className="text-sm text-emerald-600">This month</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Commission Earned</span>
                <DollarSign className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-slate-500">From completed orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={order.customer.avatar} 
                      alt={order.customer.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900">{order.id}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig[order.status].color}`}>
                          {React.createElement(statusConfig[order.status].icon, { className: "h-3 w-3 mr-1" })}
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900">{order.customer.name}</p>
                      <p className="text-sm text-slate-600">{order.customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-emerald-600">{formatCurrency(order.commission)} commission</p>
                    <p className="text-xs text-slate-500">{order.date}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-slate-100 pt-4 mb-4">
                  <h4 className="font-medium text-slate-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600">Qty {item.quantity}</span>
                          <span className="font-medium text-slate-900">{item.name}</span>
                          <span className="text-slate-500">{item.sku}</span>
                        </div>
                        <span className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-slate-900">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Shipping Address</p>
                    <p className="text-sm font-medium text-slate-900">{order.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Tracking Number</p>
                    <p className="text-sm font-medium text-slate-900">
                      {order.trackingNumber || 'Not available'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button className="px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    {order.trackingNumber && (
                      <button className="px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Track Package
                      </button>
                    )}
                  </div>
                  <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('30days');
              }}
              className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrdersPage;
