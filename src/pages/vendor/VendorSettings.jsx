import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Truck,
  CreditCard,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Save,
  Camera,
  Upload,
  Check,
  AlertCircle,
  ChevronRight,
  Palette,
  Bell,
  Shield,
  Link as LinkIcon,
  Star
} from 'lucide-react';

const VendorSettings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [storeSettings, setStoreSettings] = useState({
    name: "TechGadgets Store",
    slug: "techgadgets",
    description: "Your one-stop shop for premium tech gadgets and accessories. We offer the latest electronics at competitive prices.",
    logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=200",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    email: "contact@techgadgets.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, San Francisco, CA 94102",
    timezone: "America/Los_Angeles",
    currency: "USD",
    language: "en"
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 100,
    standardShippingRate: 9.99,
    expressShippingRate: 19.99,
    processingTime: 1,
    returnWindow: 30,
    shippingZones: [
      { name: 'Domestic', countries: ['US'], rate: 9.99 },
      { name: 'International', countries: ['CA', 'MX', 'GB'], rate: 29.99 }
    ]
  });

  const [paymentSettings, setPaymentSettings] = useState({
    methods: ['stripe', 'paypal'],
    stripeConnected: true,
    paypalConnected: false,
    payoutSchedule: 'weekly',
    minimumPayout: 50,
    taxRate: 10
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewOrder: true,
    emailLowStock: true,
    emailPayout: true,
    emailReview: false,
    pushNewOrder: true,
    smsCritical: false
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-8">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Store Settings</h1>
              <p className="text-violet-200 text-sm mt-1">Manage your store configuration</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-white text-violet-600 font-medium rounded-xl shadow-lg hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                  Saving...
                </>
              ) : showSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              {activeTab === 'store' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Store Information</h2>
                  
                  {/* Logo & Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store Logo</label>
                      <div className="relative">
                        <img
                          src={storeSettings.logo}
                          alt="Store logo"
                          className="w-32 h-32 rounded-2xl object-cover bg-slate-100"
                        />
                        <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-slate-50">
                          <Camera className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store Banner</label>
                      <div className="relative">
                        <img
                          src={storeSettings.banner}
                          alt="Store banner"
                          className="w-full h-32 rounded-2xl object-cover bg-slate-100"
                        />
                        <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-slate-50">
                          <Camera className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
                      <input
                        type="text"
                        value={storeSettings.name}
                        onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Store URL</label>
                      <div className="flex">
                        <span className="px-4 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">
                          store.com/
                        </span>
                        <input
                          type="text"
                          value={storeSettings.slug}
                          onChange={(e) => setStoreSettings({ ...storeSettings, slug: e.target.value })}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={storeSettings.description}
                      onChange={(e) => setStoreSettings({ ...storeSettings, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={storeSettings.phone}
                        onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Address
                    </label>
                    <textarea
                      value={storeSettings.address}
                      onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Shipping Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Free Shipping Threshold
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={shippingSettings.freeShippingThreshold}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Standard Shipping
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={shippingSettings.standardShippingRate}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, standardShippingRate: Number(e.target.value) })}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Express Shipping
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={shippingSettings.expressShippingRate}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, expressShippingRate: Number(e.target.value) })}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Processing Time (days)
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.processingTime}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, processingTime: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Return Window (days)
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.returnWindow}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, returnWindow: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Payment Settings</h2>
                  
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">Connected Accounts</h3>
                    
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded" />
                        <div>
                          <p className="font-medium text-slate-900">Stripe</p>
                          <p className="text-sm text-slate-500">Connected</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
                        Disconnect
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-[8px] font-bold">
                          Pay<span className="text-blue-200">Pal</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">PayPal</p>
                          <p className="text-sm text-slate-500">Not connected</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-sm bg-violet-600 text-white hover:bg-violet-700 rounded-lg">
                        Connect
                      </button>
                    </div>
                  </div>

                  {/* Payout Settings */}
                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-4">Payout Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Payout Schedule
                        </label>
                        <select
                          value={paymentSettings.payoutSchedule}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, payoutSchedule: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Minimum Payout
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <input
                            type="number"
                            value={paymentSettings.minimumPayout}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, minimumPayout: Number(e.target.value) })}
                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNewOrder', label: 'New order received', icon: Store },
                      { key: 'emailLowStock', label: 'Low stock alert', icon: AlertCircle },
                      { key: 'emailPayout', label: 'Payout completed', icon: CreditCard },
                      { key: 'emailReview', label: 'New customer review', icon: Star },
                      { key: 'pushNewOrder', label: 'Push notifications for orders', icon: Bell },
                      { key: 'smsCritical', label: 'SMS for critical alerts', icon: Phone }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-slate-400" />
                          <span className="text-slate-700">{item.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                          className="w-5 h-5 text-violet-600 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Store Appearance</h2>
                  <p className="text-slate-500">Customize your store theme and branding</p>
                  
                  <div className="p-8 bg-slate-50 rounded-2xl text-center">
                    <Palette className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Theme customization coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSettings;
