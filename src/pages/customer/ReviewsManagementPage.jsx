import { useEffect, useMemo, useState } from 'react';
import { Edit, MessageSquare, Plus, Search, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, reviewAPI } from '../../services/api';

const ReviewsManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [form, setForm] = useState({
    productId: '',
    orderId: '',
    rating: 5,
    title: '',
    comment: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, deliveredOrdersRes] = await Promise.all([
        reviewAPI.getMyReviews({ page: '1', limit: '250' }),
        orderAPI.getOrders({ status: 'DELIVERED', page: '1', limit: '100' }),
      ]);

      const reviewItems = reviewsRes?.data?.data?.items || [];
      const orders = deliveredOrdersRes?.data?.data?.items || [];
      setReviews(reviewItems);

      const detailResponses = await Promise.all(
        orders.map((order) => orderAPI.getOrderById(order.id).catch(() => null))
      );

      const productsById = new Map();
      detailResponses.forEach((response) => {
        const order = response?.data?.data;
        if (!order?.items?.length) return;

        order.items.forEach((item) => {
          if (!item.productId || productsById.has(item.productId)) return;
          productsById.set(item.productId, {
            productId: item.productId,
            orderId: order.id,
            productName: item.name || 'Product',
            productSlug: item.productSlug || '',
            imageUrl: item.imageUrl || '',
          });
        });
      });

      const reviewedProductIds = new Set(reviewItems.map((item) => item.productId));
      const availableProducts = Array.from(productsById.values()).filter((item) => !reviewedProductIds.has(item.productId));
      setEligibleProducts(availableProducts);
    } catch (error) {
      setReviews([]);
      setEligibleProducts([]);
      toast.error(error?.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const text = `${review.productName || ''} ${review.title || ''} ${review.comment || ''}`.toLowerCase();
    const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (review.isApproved ? 'approved' : 'pending') === statusFilter;
    const matchesRating = ratingFilter === 'all' || String(review.rating) === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  }), [reviews, searchQuery, statusFilter, ratingFilter]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / reviews.length;
  }, [reviews]);

  const resetForm = () => {
    setEditingReviewId(null);
    setForm({
      productId: '',
      orderId: '',
      rating: 5,
      title: '',
      comment: '',
    });
  };

  const openCreateModal = () => {
    if (eligibleProducts.length === 0) {
      toast.error('No delivered products available for a new review');
      return;
    }
    const first = eligibleProducts[0];
    setEditingReviewId(null);
    setForm({
      productId: first.productId,
      orderId: first.orderId,
      rating: 5,
      title: '',
      comment: '',
    });
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReviewId(review.id);
    setForm({
      productId: review.productId,
      orderId: review.orderId || '',
      rating: Number(review.rating) || 5,
      title: review.title || '',
      comment: review.comment || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.rating || !form.comment.trim()) {
      toast.error('Rating and review text are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReviewId) {
        await reviewAPI.updateReview(editingReviewId, {
          rating: form.rating,
          title: form.title.trim() || undefined,
          comment: form.comment.trim(),
        });
        toast.success('Review updated and sent for approval again');
      } else {
        await reviewAPI.createReview({
          productId: form.productId,
          orderId: form.orderId || undefined,
          rating: form.rating,
          title: form.title.trim() || undefined,
          comment: form.comment.trim(),
        });
        toast.success('Review submitted');
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setSubmitting(true);
    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted');
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (isApproved) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
      {isApproved ? 'Approved' : 'Pending'}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                My Reviews
              </h1>
              <p className="text-slate-600 mt-1">Create and manage your product reviews</p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Write Review
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Reviews" value={reviews.length} />
            <StatCard label="Average Rating" value={averageRating.toFixed(1)} />
            <StatCard label="Approved" value={reviews.filter((r) => r.isApproved).length} />
            <StatCard label="Pending" value={reviews.filter((r) => !r.isApproved).length} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your reviews"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              No reviews found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReviews.map((review) => (
                <div key={review.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <strong className="text-slate-900">{review.productName || 'Product'}</strong>
                        {statusBadge(review.isApproved)}
                        {review.verifiedPurchase && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Verified purchase</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${idx < Number(review.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                        <span className="text-xs text-slate-500 ml-2">
                          {review.createdAt ? new Date(review.createdAt).toLocaleString() : '-'}
                        </span>
                      </div>

                      {review.title && <p className="font-medium text-slate-900 text-sm mb-1">{review.title}</p>}
                      <p className="text-sm text-slate-600">{review.comment || 'No review text'}</p>

                      {review.adminReply && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">Admin Reply</p>
                          <p className="text-sm text-slate-700">{review.adminReply}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(review)}
                        disabled={submitting}
                        className="p-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        disabled={submitting}
                        className="p-2 rounded-lg bg-rose-100 text-rose-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingReviewId ? 'Edit Review' : 'Write Review'}</h2>
            </div>

            <div className="p-6 space-y-4">
              {!editingReviewId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Product</label>
                  <select
                    value={form.productId}
                    onChange={(e) => {
                      const selected = eligibleProducts.find((item) => item.productId === e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        productId: e.target.value,
                        orderId: selected?.orderId || '',
                      }));
                    }}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {eligibleProducts.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star className={`h-6 w-6 ${star <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Short summary (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Review</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl resize-none"
                  placeholder="Share your experience..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingReviewId ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl p-4">
    <p className="text-sm text-slate-600">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default ReviewsManagementPage;
