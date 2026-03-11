import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Download, 
  Share2, 
  Printer,
  ChevronRight,
  Home,
  ShoppingBag,
  Clock,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const orderDetails = location.state?.order || null;
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (orderDetails?.orderId) {
      navigator.clipboard.writeText(orderDetails.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Order Confirmation',
          text: `Order ${orderDetails?.orderId} confirmed!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const orderDateValue =
    orderDetails?.date
    || orderDetails?.createdAt
    || orderDetails?.created_at
    || null;

  const estimatedDeliveryValue =
    orderDetails?.estimatedDelivery
    || orderDetails?.estimated_delivery
    || null;

  const orderItems = Array.isArray(orderDetails?.items) ? orderDetails.items : [];

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <Package className="h-14 w-14 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Order Data Found</h2>
        <p className="text-slate-500 mb-6">Please place an order from checkout first.</p>
        <Link to="/checkout" className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors">
          Go To Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl lg:text-4xl font-bold mb-3"
          >
            Order Confirmed!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-emerald-100 text-lg"
          >
            Thank you for your purchase. We've sent a confirmation email to your inbox.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Order Info Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 print:shadow-none print:border-slate-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-50 rounded-xl">
                  <Package className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-slate-900">{orderDetails.orderId || orderDetails.id || 'N/A'}</p>
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(orderDateValue)}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="capitalize">{orderDetails.status}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none"
              >
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Order Items</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {orderItems.map((item) => (
                    <div key={item.id} className="p-6 flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-100"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(orderDetails.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span className={Number(orderDetails.shipping || 0) === 0 ? 'text-emerald-600' : ''}>
                        {Number(orderDetails.shipping || 0) === 0 ? 'Free' : formatCurrency(orderDetails.shipping || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span>{formatCurrency(orderDetails.tax || 0)}</span>
                    </div>
                    {Number(orderDetails.discount || 0) > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(orderDetails.discount || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>{formatCurrency(orderDetails.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 print:shadow-none"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Shipping Address</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {orderDetails.shippingAddress?.firstName} {orderDetails.shippingAddress?.lastName}<br />
                        {orderDetails.shippingAddress?.address}<br />
                        {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state} {orderDetails.shippingAddress?.zip}<br />
                        {orderDetails.shippingAddress?.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Truck className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Delivery Method</p>
                      <p className="text-sm text-slate-600 mt-1">Standard Shipping</p>
                      <p className="text-sm text-emerald-600 mt-1">
                        Estimated delivery: {estimatedDeliveryValue ? formatDate(estimatedDeliveryValue) : 'Will be shared soon'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 print:shadow-none"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Information</h2>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{orderDetails.paymentMethod}</p>
                    <p className="text-sm text-slate-500">Paid on {formatDate(orderDateValue)}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 print:hidden"
              >
                <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to={`/orders/${orderDetails.id || orderDetails.orderId}`}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-violet-50 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">View Order Details</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500" />
                  </Link>
                  <Link
                    to={`/track?order=${orderDetails.id || orderDetails.orderId}`}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-violet-50 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Track Package</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500" />
                  </Link>
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-violet-50 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Print Receipt</span>
                    <Printer className="h-4 w-4 text-slate-400 group-hover:text-violet-500" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-violet-50 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700">Share Order</span>
                    <Share2 className="h-4 w-4 text-slate-400 group-hover:text-violet-500" />
                  </button>
                </div>
              </motion.div>

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 print:hidden"
              >
                <h3 className="font-bold text-slate-900 mb-2">Need Help?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  If you have any questions about your order, our support team is here to help.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700"
                >
                  Contact Support <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Continue Shopping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25"
            >
              <ShoppingBag className="h-5 w-5" />
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <Clock className="h-5 w-5" />
              View All Orders
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
