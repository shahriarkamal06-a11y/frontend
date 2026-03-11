import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  CreditCard,
  Wallet,
  Filter,
  Search,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';

const VendorPayouts = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const payoutSummary = {
    availableBalance: 8450.00,
    pendingBalance: 3200.00,
    totalEarned: 45680.00,
    totalPayouts: 37230.00,
    nextPayoutDate: '2026-03-20',
    nextPayoutAmount: 8450.00
  };

  const payouts = [
    {
      id: 'PO-2026-001',
      date: '2026-03-01',
      amount: 5200.00,
      status: 'completed',
      method: 'bank_transfer',
      reference: 'TRX123456789',
      period: 'Feb 15 - Feb 28, 2026',
      orders: 156
    },
    {
      id: 'PO-2026-002',
      date: '2026-02-15',
      amount: 4800.00,
      status: 'completed',
      method: 'bank_transfer',
      reference: 'TRX987654321',
      period: 'Feb 1 - Feb 14, 2026',
      orders: 142
    },
    {
      id: 'PO-2026-003',
      date: '2026-02-01',
      amount: 6100.00,
      status: 'completed',
      method: 'bank_transfer',
      reference: 'TRX456789123',
      period: 'Jan 15 - Jan 31, 2026',
      orders: 189
    },
    {
      id: 'PO-2026-004',
      date: '2026-01-15',
      amount: 4500.00,
      status: 'completed',
      method: 'bank_transfer',
      reference: 'TRX789123456',
      period: 'Jan 1 - Jan 14, 2026',
      orders: 134
    },
    {
      id: 'PO-2026-005',
      date: '2026-03-15',
      amount: 3200.00,
      status: 'pending',
      method: 'bank_transfer',
      reference: null,
      period: 'Mar 1 - Mar 14, 2026',
      orders: 98
    }
  ];

  const transactions = [
    { id: 1, type: 'sale', description: 'Order #ORD-1234', amount: 89.99, date: '2026-03-10', status: 'completed' },
    { id: 2, type: 'sale', description: 'Order #ORD-1235', amount: 156.50, date: '2026-03-10', status: 'completed' },
    { id: 3, type: 'refund', description: 'Refund #REF-001', amount: -45.00, date: '2026-03-09', status: 'completed' },
    { id: 4, type: 'sale', description: 'Order #ORD-1236', amount: 234.00, date: '2026-03-09', status: 'pending' },
    { id: 5, type: 'sale', description: 'Order #ORD-1237', amount: 67.99, date: '2026-03-08', status: 'completed' },
    { id: 6, type: 'fee', description: 'Platform Fee', amount: -12.50, date: '2026-03-08', status: 'completed' }
  ];

  const filteredPayouts = payouts.filter(p => 
    filterStatus === 'all' || p.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'failed': return 'bg-rose-100 text-rose-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-8">
        <div className="px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Payouts & Earnings</h1>
          <p className="text-violet-200 text-sm mt-1">Manage your payouts and view earnings history</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                Available
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(payoutSummary.availableBalance)}</p>
            <p className="text-sm text-slate-500 mt-1">Ready for withdrawal</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(payoutSummary.pendingBalance)}</p>
            <p className="text-sm text-slate-500 mt-1">Processing orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-violet-50 rounded-xl">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                Lifetime
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(payoutSummary.totalEarned)}</p>
            <p className="text-sm text-slate-500 mt-1">Total earnings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Next Payout
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(payoutSummary.nextPayoutAmount)}</p>
            <p className="text-sm text-slate-500 mt-1">{formatDate(payoutSummary.nextPayoutDate)}</p>
          </motion.div>
        </div>

        {/* Payout Schedule Info */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">Payout Schedule</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your payouts are processed automatically every week on Wednesdays.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm">
                Change Schedule
              </button>
              <button className="px-4 py-2 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-all text-sm">
                Request Early Payout
              </button>
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900">Payout History</h3>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <button className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="px-6 py-4">Payout ID</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-900">{payout.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{payout.period}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{formatDate(payout.date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{payout.orders}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
            <button className="text-sm text-violet-600 hover:underline">View All</button>
          </div>
          
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'sale' ? 'bg-emerald-100' :
                    transaction.type === 'refund' ? 'bg-rose-100' :
                    'bg-slate-200'
                  }`}>
                    {transaction.type === 'sale' && <ArrowUpRight className="h-4 w-4 text-emerald-600" />}
                    {transaction.type === 'refund' && <ArrowDownRight className="h-4 w-4 text-rose-600" />}
                    {transaction.type === 'fee' && <DollarSign className="h-4 w-4 text-slate-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPayouts;
