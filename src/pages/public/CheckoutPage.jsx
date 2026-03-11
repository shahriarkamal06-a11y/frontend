import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CreditCard, ChevronRight, Check, Shield, MapPin, ShoppingBag, Tag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils';
import { orderAPI, userAPI } from '../../services/api';
import { useAuthStore, useCartStore, useStoreSettingsStore } from '../../store';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { store, loadSettings } = useStoreSettingsStore();
  const {
    items,
    subtotal,
    tax,
    shipping,
    discount,
    loadCart,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [step, setStep] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
    shippingMethod: 'standard',
  });

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const shippingConfig = store?.shippingConfig || {};
  const shippingOptions = useMemo(
    () => (shippingConfig.options || []).filter((option) => option.enabled !== false),
    [shippingConfig.options]
  );
  const defaultShippingOptionId = useMemo(() => {
    if (shippingConfig.defaultOptionId && shippingOptions.some((option) => option.id === shippingConfig.defaultOptionId)) {
      return shippingConfig.defaultOptionId;
    }
    return shippingOptions[0]?.id || '';
  }, [shippingConfig.defaultOptionId, shippingOptions]);

  useEffect(() => {
    if (!shippingOptions.length) return;
    setFormData((prev) => {
      if (shippingOptions.some((option) => option.id === prev.shippingMethod)) {
        return prev;
      }
      return { ...prev, shippingMethod: defaultShippingOptionId };
    });
  }, [defaultShippingOptionId, shippingOptions]);

  const prefillFromUser = useCallback((profile) => {
    if (!profile) return;

    const shippingAddress = profile.shippingAddress || profile.metadata?.shippingAddress || {};
    const profileAddress = profile.address || profile.metadata?.address || shippingAddress.addressLine1 || '';
    const profileCity = profile.city || profile.metadata?.city || shippingAddress.city || '';
    const profileState = profile.state || profile.metadata?.state || shippingAddress.state || '';
    const profileZip = profile.zip || profile.postalCode || profile.metadata?.zip || profile.metadata?.postalCode || shippingAddress.postalCode || '';
    const profileCountry = profile.country || profile.metadata?.country || shippingAddress.country || '';

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || profile.firstName || '',
      lastName: prev.lastName || profile.lastName || '',
      email: prev.email || profile.email || '',
      phone: prev.phone || profile.phone || shippingAddress.phone || '',
      address: prev.address || profileAddress,
      city: prev.city || profileCity,
      state: prev.state || profileState,
      zip: prev.zip || profileZip,
      country: prev.country !== 'US' ? prev.country : (profileCountry || prev.country),
    }));
  }, []);

  const prefillFromSavedAddress = useCallback((savedAddress) => {
    if (!savedAddress) return;

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || savedAddress.firstName || '',
      lastName: prev.lastName || savedAddress.lastName || '',
      phone: prev.phone || savedAddress.phone || '',
      address: prev.address || savedAddress.addressLine1 || '',
      city: prev.city || savedAddress.city || '',
      state: prev.state || savedAddress.state || '',
      zip: prev.zip || savedAddress.postalCode || '',
      country: prev.country !== 'US' ? prev.country : (savedAddress.country || prev.country),
    }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    prefillFromUser(user);
  }, [isAuthenticated, user, prefillFromUser]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;
    const loadProfile = async () => {
      try {
        const [profileResponse, addressesResponse] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getAddresses(),
        ]);

        const profile = profileResponse?.data?.data;
        const addresses = addressesResponse?.data?.data?.items || [];
        const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
        if (!mounted) return;

        if (profile) {
          useAuthStore.setState((state) => ({ ...state, user: profile }));
          prefillFromUser(profile);
        }
        prefillFromSavedAddress(defaultAddress);
      } catch (error) {
        console.error('Failed to load profile for checkout prefill:', error);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.id, prefillFromUser, prefillFromSavedAddress]);

  const normalizedItems = useMemo(() => items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: Number(item.price) || 0,
    imageUrl: item.imageUrl || item.image_url || '',
  })), [items]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateShipping = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'zip', 'country'];
    const missing = requiredFields.find((field) => !String(formData[field] || '').trim());
    if (missing) {
      toast.error('Please complete all required shipping fields');
      return false;
    }
    if (shippingOptions.length > 0 && !formData.shippingMethod) {
      toast.error('Please select a shipping method');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    const requiredFields = ['cardNumber', 'expiry', 'cvv', 'nameOnCard'];
    const missing = requiredFields.find((field) => !String(formData[field] || '').trim());
    if (missing) {
      toast.error('Please complete payment details');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place your order');
      navigate('/login', { replace: true });
      return;
    }

    if (normalizedItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const shippingAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        addressLine1: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.zip.trim(),
        country: formData.country.trim(),
        phone: formData.phone.trim(),
      };

      const payload = {
        shippingAddress,
        billingAddress: shippingAddress,
        shippingMethod: formData.shippingMethod,
      };

      const response = await orderAPI.createOrder(payload);
      const createdOrder = response?.data?.data;
      const createdAtValue = createdOrder?.createdAt || new Date().toISOString();
      const estimatedDelivery = (() => {
        const baseDate = new Date(createdAtValue);
        if (Number.isNaN(baseDate.getTime())) return null;
        baseDate.setDate(baseDate.getDate() + 5);
        return baseDate.toISOString();
      })();

      const confirmationOrder = {
        id: createdOrder?.id,
        orderId: createdOrder?.orderNumber || createdOrder?.id,
        date: createdAtValue,
        status: (createdOrder?.status || 'CONFIRMED').toLowerCase(),
        items: normalizedItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity,
          image: item.imageUrl,
        })),
        subtotal: Number(createdOrder?.subtotal) || subtotal,
        shipping: Number(createdOrder?.shippingCost) || resolvedShippingCost,
        tax: Number(createdOrder?.tax) || tax,
        discount: Number(createdOrder?.discount) || discount,
        total: Number(createdOrder?.total) || displayTotal,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        paymentMethod: `Card ending in ${String(formData.cardNumber).slice(-4) || '****'}`,
        trackingNumber: createdOrder?.trackingNumber || null,
        estimatedDelivery,
      };

      await clearCart();
      toast.success('Order placed successfully');
      navigate('/thank-you', { state: { order: confirmationOrder } });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      return;
    }

    const result = await applyCoupon(code);
    if (result?.success) {
      toast.success('Coupon applied');
      setCouponInput('');
      return;
    }

    toast.error(result?.error || 'Failed to apply coupon');
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    toast.success('Coupon removed');
  };

  const normalizeCity = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const resolveShippingRate = (option, city) => {
    if (!option) return 0;
    let baseRate = Number(option.baseRate) || 0;
    const cityKey = normalizeCity(city);
    if (cityKey) {
      const cityRate = (option.cityRates || []).find(
        (rate) => normalizeCity(rate.city) === cityKey
      );
      if (cityRate) {
        baseRate = Number(cityRate.rate) || 0;
      }
    }

    const freeShippingEligible = shippingConfig.enableFreeShipping !== false && option.freeShippingEligible !== false;
    const threshold = Number(shippingConfig.freeShippingThreshold) || 0;
    if (freeShippingEligible && subtotal >= threshold && subtotal > 0) {
      return 0;
    }
    return baseRate;
  };

  const selectedShippingOption = useMemo(() => {
    if (!shippingOptions.length) return null;
    return shippingOptions.find((option) => option.id === formData.shippingMethod)
      || shippingOptions.find((option) => option.id === defaultShippingOptionId)
      || shippingOptions[0];
  }, [defaultShippingOptionId, formData.shippingMethod, shippingOptions]);

  const selectedShippingCost = resolveShippingRate(selectedShippingOption, formData.city);
  const resolvedShippingCost = shippingOptions.length > 0 ? selectedShippingCost : shipping;
  const displayTotal = Math.max(subtotal + tax + resolvedShippingCost - discount, 0);

  const steps = [
    { num: 1, label: 'Shipping', icon: MapPin },
    { num: 2, label: 'Payment', icon: CreditCard },
    { num: 3, label: 'Review', icon: Check },
  ];

  if (normalizedItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your Cart is Empty</h2>
        <p className="text-slate-500 mb-6">Add products before checkout.</p>
        <Link to="/products" className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-2xl">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Checkout</h1>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Lock className="h-3.5 w-3.5" /> Secure Checkout
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step >= s.num ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                  {step > s.num ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'firstName', label: 'First Name', placeholder: 'John' },
                    { name: 'lastName', label: 'Last Name', placeholder: 'Doe' },
                    { name: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email', full: true },
                    { name: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
                    { name: 'address', label: 'Street Address', placeholder: '123 Main Street', full: true },
                    { name: 'city', label: 'City', placeholder: 'San Francisco' },
                    { name: 'state', label: 'State', placeholder: 'California' },
                    { name: 'zip', label: 'ZIP Code', placeholder: '94102' },
                  ].map((field) => (
                    <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type || 'text'}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Shipping Method</h3>
                  {shippingOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">No shipping methods are configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((option) => {
                        const optionRate = resolveShippingRate(option, formData.city);
                        const isSelected = formData.shippingMethod === option.id;
                        const showFree = optionRate === 0 && subtotal > 0;
                        const eta = option.estimatedDaysMin && option.estimatedDaysMax
                          ? `${option.estimatedDaysMin}-${option.estimatedDaysMax} days`
                          : option.estimatedDaysMin
                            ? `${option.estimatedDaysMin}+ days`
                            : null;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, shippingMethod: option.id }))}
                            className={`w-full text-left border rounded-2xl p-4 transition-all ${isSelected
                              ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                                {option.description && <p className="text-xs text-slate-500 mt-1">{option.description}</p>}
                                {eta && <p className="text-xs text-slate-400 mt-1">Estimated: {eta}</p>}
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${showFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                                  {showFree ? 'Free' : formatCurrency(optionRate)}
                                </p>
                                {option.cityRates?.length > 0 && !formData.city && (
                                  <p className="text-[11px] text-slate-400 mt-1">City-specific rates apply</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (validateShipping()) {
                      setStep(2);
                    }
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all text-sm"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900">Payment Information</h2>
                <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm text-slate-600">Your payment information is encrypted and secure.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Card Number</label>
                    <input
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name on Card</label>
                    <input
                      name="nameOnCard"
                      value={formData.nameOnCard}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
                      <input
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">CVV</label>
                      <input
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        type="password"
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-all text-sm">Back</button>
                  <button
                    onClick={() => {
                      if (validatePayment()) {
                        setStep(3);
                      }
                    }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 transition-all text-sm"
                >
                  Review Order
                </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-900">Review Your Order</h2>
                <div className="space-y-4">
                  {normalizedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover bg-slate-100" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                  <p className="font-medium text-slate-900">Shipping to:</p>
                  <p className="text-slate-600">{formData.firstName} {formData.lastName}</p>
                  <p className="text-slate-500">{formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
                  {selectedShippingOption && (
                    <p className="text-slate-500">Method: {selectedShippingOption.label}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-6 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-all text-sm">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Lock className="h-4 w-4" />
                    {placingOrder ? 'Placing Order...' : `Place Order - ${formatCurrency(displayTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:sticky lg:top-24">
              <h3 className="font-bold text-lg mb-6">Order Summary</h3>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">Coupon Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
                {couponCode && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 p-2">
                    <span className="text-xs font-medium text-emerald-700">Code "{couponCode}" applied</span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-emerald-600 hover:underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-6">
                {normalizedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-slate-100" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-slate-900 text-white text-[10px] rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Shipping
                    {resolvedShippingCost === 0 && <Truck className="h-3.5 w-3.5 text-emerald-500" />}
                  </span>
                  <span>{resolvedShippingCost === 0 ? <span className="text-emerald-600">Free</span> : formatCurrency(resolvedShippingCost)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-lg text-slate-900"><span>Total</span><span>{formatCurrency(displayTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
