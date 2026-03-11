import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Camera,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Home,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Save,
  Shield,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { orderAPI, userAPI, wishlistAPI } from '../../services/api';

const EMPTY_ADDRESS_FORM = {
  label: 'Home',
  firstName: '',
  lastName: '',
  company: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  isDefault: false,
};

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || '',
    country: user?.country || '',
    bio: user?.bio || '',
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: false,
    sms: false,
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    savedAddresses: 0,
    paymentMethods: 0,
  });
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zip || '',
      country: user.country || '',
      bio: user.bio || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    loadAddresses();
    loadOverviewStats();
  }, [user?.id]);

  const loadOverviewStats = async () => {
    try {
      const [ordersResponse, wishlistResponse] = await Promise.allSettled([
        orderAPI.getOrders({ page: '1', limit: '1' }),
        wishlistAPI.getWishlist(),
      ]);

      const totalOrders =
        ordersResponse.status === 'fulfilled'
          ? Number(
            ordersResponse.value?.data?.data?.pagination?.total
            ?? ordersResponse.value?.data?.data?.items?.length
            ?? 0
          )
          : 0;

      const wishlistItems =
        wishlistResponse.status === 'fulfilled'
          ? Number(wishlistResponse.value?.data?.data?.items?.length || 0)
          : 0;

      setStats((prev) => ({
        ...prev,
        totalOrders,
        wishlistItems,
      }));
    } catch {
      // Keep overview cards usable even if one endpoint fails.
      setStats((prev) => ({
        ...prev,
        totalOrders: 0,
        wishlistItems: 0,
      }));
    }
  };

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await userAPI.getAddresses();
      const items = response?.data?.data?.items || [];
      setAddresses(items);
      setStats((prev) => ({ ...prev, savedAddresses: items.length }));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleChange = (e) => setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profile);
      if (result?.success) toast.success('Profile updated');
      else toast.error(result?.error || 'Failed to update profile');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      country: profile.country || '',
    });
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label || 'Home',
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      company: address.company || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      phone: address.phone || '',
      isDefault: Boolean(address.isDefault),
    });
    setShowAddressForm(true);
    setActiveTab('addresses');
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getAddressPayload = () => ({
    label: String(addressForm.label || '').trim() || 'Home',
    firstName: String(addressForm.firstName || '').trim(),
    lastName: String(addressForm.lastName || '').trim(),
    company: String(addressForm.company || '').trim(),
    addressLine1: String(addressForm.addressLine1 || '').trim(),
    addressLine2: String(addressForm.addressLine2 || '').trim(),
    city: String(addressForm.city || '').trim(),
    state: String(addressForm.state || '').trim(),
    postalCode: String(addressForm.postalCode || '').trim(),
    country: String(addressForm.country || '').trim(),
    phone: String(addressForm.phone || '').trim(),
    isDefault: Boolean(addressForm.isDefault),
  });

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressSubmitting(true);
    try {
      const payload = getAddressPayload();
      if (editingAddressId) {
        await userAPI.updateAddress(editingAddressId, payload);
        toast.success('Address updated');
      } else {
        await userAPI.createAddress(payload);
        toast.success('Address added');
      }
      await loadAddresses();
      closeAddressForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await userAPI.setDefaultAddress(addressId);
      toast.success('Default address updated');
      await loadAddresses();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to set default address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm('Delete this saved address?');
    if (!confirmed) return;

    try {
      await userAPI.deleteAddress(addressId);
      toast.success('Address deleted');
      await loadAddresses();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete address');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Account Settings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:sticky lg:top-24">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="h-24 w-24 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-500/25">
                    {profile.firstName?.[0]?.toUpperCase() || 'U'}
                    {profile.lastName?.[0]?.toUpperCase() || ''}
                  </div>
                  <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">
                    <Camera className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 mt-3">{profile.firstName} {profile.lastName}</h3>
                <p className="text-sm text-slate-500">{profile.email}</p>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" /> {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900">Account Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/orders" className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all">
                    <Package className="w-6 h-6 text-violet-600 mb-3" />
                    <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                    <p className="text-sm text-slate-500">Orders</p>
                  </Link>
                  <Link to="/wishlist" className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all">
                    <Heart className="w-6 h-6 text-pink-600 mb-3" />
                    <p className="text-2xl font-bold text-slate-900">{stats.wishlistItems}</p>
                    <p className="text-sm text-slate-500">Wishlist</p>
                  </Link>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className="text-left bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all"
                  >
                    <Home className="w-6 h-6 text-blue-600 mb-3" />
                    <p className="text-2xl font-bold text-slate-900">{stats.savedAddresses}</p>
                    <p className="text-sm text-slate-500">Saved Addresses</p>
                  </button>
                  <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <CreditCard className="w-6 h-6 text-emerald-600 mb-3" />
                    <p className="text-2xl font-bold text-slate-900">{stats.paymentMethods}</p>
                    <p className="text-sm text-slate-500">Payments</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'firstName', label: 'First Name', icon: User },
                    { name: 'lastName', label: 'Last Name', icon: User },
                    { name: 'email', label: 'Email', icon: Mail, type: 'email', full: true },
                    { name: 'phone', label: 'Phone', icon: Phone },
                  ].map((field) => (
                    <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          name={field.name}
                          type={field.type || 'text'}
                          value={profile[field.name]}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <h3 className="font-bold text-slate-900 pt-2 border-t border-slate-100">Default Profile Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'address', label: 'Street Address', full: true },
                    { name: 'city', label: 'City' },
                    { name: 'state', label: 'State' },
                    { name: 'zip', label: 'ZIP Code' },
                    { name: 'country', label: 'Country' },
                  ].map((field) => (
                    <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        name={field.name}
                        value={profile[field.name]}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 animate-fade-in space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, delete and set default address.</p>
                  </div>
                  <button
                    onClick={openNewAddressForm}
                    className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Address
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <h3 className="font-semibold text-slate-900">{editingAddressId ? 'Edit Address' : 'New Address'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'label', label: 'Label', placeholder: 'Home' },
                        { name: 'firstName', label: 'First Name', placeholder: 'John' },
                        { name: 'lastName', label: 'Last Name', placeholder: 'Doe' },
                        { name: 'company', label: 'Company (Optional)', placeholder: 'Company' },
                        { name: 'phone', label: 'Phone', placeholder: '+1 555...' },
                        { name: 'country', label: 'Country', placeholder: 'United States' },
                        { name: 'addressLine1', label: 'Address Line 1', placeholder: 'Street, house no.', full: true },
                        { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Apartment, suite', full: true },
                        { name: 'city', label: 'City', placeholder: 'City' },
                        { name: 'state', label: 'State', placeholder: 'State' },
                        { name: 'postalCode', label: 'Postal Code', placeholder: '10001' },
                      ].map((field) => (
                        <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                          <input
                            name={field.name}
                            value={addressForm[field.name]}
                            onChange={handleAddressFormChange}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressFormChange}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      Set as default
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={addressSubmitting}
                        className="px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl disabled:opacity-60"
                      >
                        {addressSubmitting ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={closeAddressForm}
                        className="px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addressesLoading ? (
                  <div className="text-center py-8 text-sm text-slate-500">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl">
                    No saved addresses found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-slate-900">{address.label || 'Address'}</p>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p className="font-medium text-slate-800">{address.firstName} {address.lastName}</p>
                          {address.company && <p>{address.company}</p>}
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && <p>{address.addressLine2}</p>}
                          <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}</p>
                          <p>{address.country}</p>
                          {address.phone && <p>{address.phone}</p>}
                        </div>
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => openEditAddressForm(address)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Current password"
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Update Password
                  </button>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-slate-900">2FA is currently disabled</p>
                      <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-xl hover:bg-violet-100">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about your order status changes' },
                    { key: 'promotions', label: 'Promotions & Deals', desc: 'Receive special offers and discount codes' },
                    { key: 'newsletter', label: 'Newsletter', desc: 'Weekly newsletter with product highlights' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive text messages for important updates' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
                    <select className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                    <select className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                    <select className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl text-sm flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
