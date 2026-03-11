import { useState } from 'react';
import { Gift, CreditCard, Mail, Calendar, DollarSign, Star, Heart, ShoppingBag, Sparkles, Check, Info } from 'lucide-react';

const GiftCardsPage = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const presetAmounts = [25, 50, 75, 100, 150, 200, 250, 500];

  const giftCardDesigns = [
    { id: 'birthday', name: 'Birthday', color: 'from-pink-500 to-rose-500', icon: '🎂' },
    { id: 'wedding', name: 'Wedding', color: 'from-violet-500 to-purple-500', icon: '💍' },
    { id: 'thankyou', name: 'Thank You', color: 'from-emerald-500 to-teal-500', icon: '🙏' },
    { id: 'congrats', name: 'Congratulations', color: 'from-amber-500 to-orange-500', icon: '🎉' },
    { id: 'holiday', name: 'Holiday', color: 'from-red-500 to-green-500', icon: '🎄' },
    { id: 'general', name: 'General', color: 'from-blue-500 to-indigo-500', icon: '🎁' },
  ];

  const [selectedDesign, setSelectedDesign] = useState('general');

  const recentOrders = [
    { id: 'GC-001', amount: 100, recipient: 'Sarah Johnson', status: 'Delivered', date: '2026-02-28', design: 'birthday' },
    { id: 'GC-002', amount: 50, recipient: 'Mike Chen', status: 'Pending', date: '2026-03-01', design: 'general' },
    { id: 'GC-003', amount: 75, recipient: 'Emma Davis', status: 'Delivered', date: '2026-02-25', design: 'wedding' },
    { id: 'GC-004', amount: 150, recipient: 'Alex Thompson', status: 'Scheduled', date: '2026-03-15', design: 'congrats' },
  ];

  const balanceHistory = [
    { id: 'GC-123456', amount: 100, date: '2026-02-20', status: 'Received', from: 'Birthday Gift' },
    { id: 'GC-789012', amount: -25.99, date: '2026-02-22', status: 'Used', for: 'Wireless Headphones' },
    { id: 'GC-345678', amount: 50, date: '2026-02-25', status: 'Received', from: 'Thank You Gift' },
    { id: 'GC-901234', amount: -15.99, date: '2026-02-28', status: 'Used', for: 'Phone Case' },
  ];

  const totalBalance = balanceHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Gift className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Gift Cards
            </h1>
            <p className="text-lg text-slate-600">
              Give the perfect gift with our digital gift cards - instant delivery, endless possibilities
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('buy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'buy'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Buy Gift Card
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'orders'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === 'balance'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Check Balance
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Buy Gift Card Tab */}
        {activeTab === 'buy' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Amount Selection */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Select Amount</h2>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-3 px-4 rounded-xl font-medium transition-all ${
                          selectedAmount === amount
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Recipient Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Date (Optional)</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Personal Message (Optional)</label>
                      <textarea
                        placeholder="Add a personal message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Design Preview */}
              <div className="space-y-6">
                {/* Design Selection */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Choose Design</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {giftCardDesigns.map((design) => (
                      <button
                        key={design.id}
                        onClick={() => setSelectedDesign(design.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          selectedDesign === design.id
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${design.color} flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                          {design.icon}
                        </div>
                        <p className="text-sm font-medium text-slate-700">{design.name}</p>
                        {selectedDesign === design.id && (
                          <div className="absolute -top-2 -right-2 h-6 w-6 bg-violet-600 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
                  <div className={`relative h-48 rounded-xl bg-gradient-to-br ${giftCardDesigns.find(d => d.id === selectedDesign)?.color} p-6 text-white shadow-lg`}>
                    <div className="absolute top-4 right-4">
                      <Sparkles className="h-6 w-6 text-white/50" />
                    </div>
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <p className="text-white/80 text-sm mb-1">Gift Card</p>
                        <p className="text-3xl font-bold">${customAmount || selectedAmount}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm">Perfect for any occasion</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Purchase Gift Card - ${customAmount || selectedAmount}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Never Expires</h3>
                <p className="text-sm text-slate-600">Our gift cards have no expiration date</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Instant Delivery</h3>
                <p className="text-sm text-slate-600">Send directly to their email inbox</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Personal Touch</h3>
                <p className="text-sm text-slate-600">Add a custom message and design</p>
              </div>
            </div>
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Gift Card Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Recipient</th>
                      <th className="pb-3 pr-4">Design</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-sm">
                        <td className="py-3 pr-4 font-medium text-slate-900">{order.id}</td>
                        <td className="py-3 pr-4 font-medium text-slate-900">${order.amount}</td>
                        <td className="py-3 pr-4 text-slate-600">{order.recipient}</td>
                        <td className="py-3 pr-4">
                          <span className="capitalize text-slate-600">{order.design}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                            order.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-500">{order.date}</td>
                        <td className="py-3">
                          <button className="text-violet-600 hover:text-violet-700 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Check Balance Tab */}
        {activeTab === 'balance' && (
          <div className="max-w-4xl mx-auto">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Current Balance</p>
                  <p className="text-4xl font-bold">${totalBalance.toFixed(2)}</p>
                </div>
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Gift className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Balance History */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {balanceHistory.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        item.amount > 0 ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}>
                        {item.amount > 0 ? (
                          <Heart className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-rose-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.status === 'Received' ? item.from : item.for}
                        </p>
                        <p className="text-sm text-slate-500">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.amount > 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem Card */}
            <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Have a Gift Card?</h3>
                  <p className="text-slate-600 mb-4">
                    Enter your gift card code at checkout to apply your balance. You can also check your balance anytime here.
                  </p>
                  <button className="px-4 py-2 bg-white text-amber-600 font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-all">
                    Redeem Gift Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardsPage;
