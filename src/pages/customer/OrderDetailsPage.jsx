import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Package,
  Truck,
  MapPin,
  Download,
  Printer,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils';
import { orderAPI } from '../../services/api';

const parseAddress = (address) => {
  if (!address) return null;
  if (typeof address === 'object') return address;
  try {
    return JSON.parse(address);
  } catch {
    return null;
  }
};

const canCancelOrder = (status) => ['PENDING', 'CONFIRMED'].includes(status);

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getOrderById(orderId);
      setOrder(response?.data?.data || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const shippingAddress = useMemo(() => parseAddress(order?.shippingAddress), [order?.shippingAddress]);
  const billingAddress = useMemo(() => parseAddress(order?.billingAddress), [order?.billingAddress]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await orderAPI.cancelOrder(order.id);
      toast.success('Order cancelled');
      await loadOrder();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvoice = async () => {
    if (!order) return;
    try {
      const response = await orderAPI.getOrderInvoice(order.id);
      const data = response?.data?.data;
      const invoiceJson = JSON.stringify(data, null, 2);
      const blob = new Blob([invoiceJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderNumber || order.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <Package className="h-14 w-14 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">We could not find this order.</p>
        <Link to="/orders" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/orders" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Order {order.orderNumber || order.id}</h1>
                <p className="text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
              {(order.status || 'PENDING').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-white" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                      {item.productSlug && (
                        <Link to={`/products/${item.productSlug}`} className="text-sm text-violet-600 hover:underline mt-1 inline-block">
                          View product
                        </Link>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(item.total || 0)}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(item.price || 0)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{formatCurrency(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-900">{formatCurrency(order.shippingCost || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">{formatCurrency(order.tax || 0)}</span>
                </div>
                {(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount</span>
                    <span className="text-emerald-600">-{formatCurrency(order.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{formatCurrency(order.total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Address
                </h3>
                {shippingAddress ? (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="font-medium text-slate-900">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.addressLine1 || shippingAddress.address}</p>
                    {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode || shippingAddress.zip}</p>
                    <p>{shippingAddress.country}</p>
                    {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No shipping address available.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Billing Address
                </h3>
                {billingAddress ? (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="font-medium text-slate-900">{billingAddress.firstName} {billingAddress.lastName}</p>
                    <p>{billingAddress.addressLine1 || billingAddress.address}</p>
                    {billingAddress.addressLine2 && <p>{billingAddress.addressLine2}</p>}
                    <p>{billingAddress.city}, {billingAddress.state} {billingAddress.postalCode || billingAddress.zip}</p>
                    <p>{billingAddress.country}</p>
                    {billingAddress.phone && <p>{billingAddress.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No billing address available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleInvoice}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <Download className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Download Invoice</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Printer className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Print Order</span>
                </button>

                {canCancelOrder(order.status) && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-60"
                  >
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <RotateCcw className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {actionLoading ? 'Cancelling...' : 'Cancel Order'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
