import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Truck, Eye, Download, Filter, Search, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils';

const ReturnsHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReturns = async () => {
      try {
        // Replace with actual API call
        // const response = await returnsAPI.getReturns();
        // setReturns(response.data);
        setReturns([]);
      } catch (error) {
        console.error('Failed to load returns:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReturns();
  }, []);

  const statusConfig = {
    pending: { color: 'bg-amber-50 text-amber-700', icon: Clock, label: 'Pending' },
    processing: { color: 'bg-blue-50 text-blue-700', icon: RefreshCw, label: 'Processing' },
    approved: { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'bg-rose-50 text-rose-700', icon: XCircle, label: 'Rejected' },
    completed: { color: 'bg-green-50 text-green-700', icon: CheckCircle, label: 'Completed' },
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         returnItem.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         returnItem.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === '30days' && new Date(returnItem.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                       (dateFilter === '90days' && new Date(returnItem.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
                       (dateFilter === 'year' && new Date(returnItem.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalRefunds = returns.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.refundAmount, 0);
  const pendingReturns = returns.filter(r => ['pending', 'processing'].includes(r.status)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Returns History
              </h1>
              <p className="text-slate-600">Track and manage your return requests</p>
            </div>
            <Link 
              to="/returns/new"
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30 transition-all flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              New Return Request
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Returns</span>
                <Package className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{returns.length}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Pending Returns</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{pendingReturns}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total Refunded</span>
                <RefreshCw className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRefunds)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Success Rate</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round((returns.filter(r => ['approved', 'completed'].includes(r.status)).length / returns.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by RMA number, order ID, or product name..."
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
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="space-y-4">
          {filteredReturns.map((returnItem) => (
            <div key={returnItem.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900">{returnItem.id}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig[returnItem.status].color}`}>
                        {React.createElement(statusConfig[returnItem.status].icon, { className: "h-3 w-3 mr-1" })}
                        {statusConfig[returnItem.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Order: {returnItem.orderId}</span>
                      <span>•</span>
                      <span>{returnItem.date}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-900">{formatCurrency(returnItem.refundAmount)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReturn(selectedReturn?.id === returnItem.id ? null : returnItem)}
                    className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {selectedReturn?.id === returnItem.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Items Summary */}
                <div className="space-y-2 mb-4">
                  {returnItem.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600">Qty {item.quantity}</span>
                        <span className="font-medium text-slate-900">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{formatCurrency(item.price)}</p>
                        <p className="text-xs text-slate-500">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expanded Details */}
                {selectedReturn?.id === returnItem.id && (
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Return Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Refund Method:</span>
                            <span className="font-medium text-slate-900">{returnItem.refundMethod}</span>
                          </div>
                          {returnItem.trackingNumber && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Tracking Number:</span>
                              <span className="font-medium text-slate-900">{returnItem.trackingNumber}</span>
                            </div>
                          )}
                          {returnItem.estimatedDelivery && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Est. Delivery:</span>
                              <span className="font-medium text-slate-900">{returnItem.estimatedDelivery}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Actions</h4>
                        <div className="flex gap-2">
                          {returnItem.trackingNumber && (
                            <button className="px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                              <Truck className="h-3 w-3" />
                              Track Package
                            </button>
                          )}
                          <button className="px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                            <Download className="h-3 w-3" />
                            Download Label
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Status Timeline</h4>
                      <div className="space-y-3">
                        {returnItem.updates.map((update, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                                {React.createElement(statusConfig[update.status.toLowerCase()]?.icon || Clock, { className: "h-4 w-4 text-slate-600" })}
                              </div>
                              {index < returnItem.updates.length - 1 && (
                                <div className="w-0.5 h-8 bg-slate-200 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-900">{update.status}</p>
                                <p className="text-xs text-slate-500">{update.date}</p>
                              </div>
                              <p className="text-sm text-slate-600">{update.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No returns found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('all');
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

export default ReturnsHistoryPage;
