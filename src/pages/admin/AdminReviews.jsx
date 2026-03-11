import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageSquare, Search, Star, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewAPI } from '../../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [replyingId, setReplyingId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getActionLabel = (action) => {
    if (action === 'approve') return 'approved';
    if (action === 'reject') return 'rejected';
    return 'deleted';
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewAPI.getReviews({ page: '1', limit: '250' });
      const items = response?.data?.data?.items || [];
      setReviews(items);
    } catch (error) {
      setReviews([]);
      toast.error(error?.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const normalizedReviews = useMemo(
    () => reviews.map((review) => ({
      ...review,
      status: review.isApproved ? 'approved' : 'pending',
      text: review.comment || review.title || '',
    })),
    [reviews]
  );

  const filteredReviews = useMemo(() => normalizedReviews.filter((review) => {
    const searchable = [
      review.productName || '',
      review.userName || '',
      review.userEmail || '',
      review.text || '',
    ].join(' ').toLowerCase();

    const matchesSearch = !searchQuery || searchable.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || String(review.rating) === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  }), [normalizedReviews, searchQuery, statusFilter, ratingFilter]);

  const stats = useMemo(() => {
    const total = normalizedReviews.length;
    const pending = normalizedReviews.filter((item) => !item.isApproved).length;
    const approved = total - pending;
    const avg = total ? normalizedReviews.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / total : 0;
    return { total, pending, approved, avg };
  }, [normalizedReviews]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredReviews.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredReviews.map((item) => item.id)));
  };

  const runBulkAction = async (action) => {
    if (selectedIds.size === 0) return;

    setSubmitting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => {
          if (action === 'approve') return reviewAPI.approveReview(id);
          if (action === 'reject') return reviewAPI.rejectReview(id);
          return reviewAPI.deleteReview(id);
        })
      );
      toast.success(`Selected reviews ${getActionLabel(action)}`);
      setSelectedIds(new Set());
      await loadReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${action} selected reviews`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleAction = async (id, action) => {
    setSubmitting(true);
    try {
      if (action === 'approve') await reviewAPI.approveReview(id);
      else if (action === 'reject') await reviewAPI.rejectReview(id);
      else await reviewAPI.deleteReview(id);
      toast.success(`Review ${getActionLabel(action)}`);
      await loadReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${action} review`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (id) => {
    const trimmed = replyDraft.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await reviewAPI.replyToReview(id, trimmed);
      toast.success('Reply posted');
      setReplyingId(null);
      setReplyDraft('');
      await loadReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews & Ratings</h1>
          <p className="text-slate-500 mt-1">Moderate customer feedback and reply as admin</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runBulkAction('approve')}
            disabled={submitting || selectedIds.size === 0}
            className="px-3 py-2 text-sm rounded-lg bg-emerald-100 text-emerald-700 disabled:opacity-50"
          >
            Approve Selected
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('reject')}
            disabled={submitting || selectedIds.size === 0}
            className="px-3 py-2 text-sm rounded-lg bg-amber-100 text-amber-700 disabled:opacity-50"
          >
            Reject Selected
          </button>
          <button
            type="button"
            onClick={() => runBulkAction('delete')}
            disabled={submitting || selectedIds.size === 0}
            className="px-3 py-2 text-sm rounded-lg bg-rose-100 text-rose-700 disabled:opacity-50"
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Reviews" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Avg Rating" value={stats.avg.toFixed(1)} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, customer, or review text"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={filteredReviews.length > 0 && selectedIds.size === filteredReviews.length}
            onChange={toggleSelectAll}
            className="h-4 w-4"
          />
          <span>{selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all visible reviews'}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No reviews found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(review.id)}
                    onChange={() => toggleSelect(review.id)}
                    className="h-4 w-4 mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <strong className="text-slate-900">{review.productName || 'Product'}</strong>
                      <span className="text-xs text-slate-500">by {review.userName || 'Customer'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
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
                    <p className="text-sm text-slate-600">{review.text || 'No review text provided.'}</p>

                    {review.adminReply && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Admin Reply</p>
                        <p className="text-sm text-slate-700">{review.adminReply}</p>
                      </div>
                    )}

                    {replyingId === review.id && (
                      <div className="mt-3">
                        <textarea
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                          rows={3}
                          placeholder="Write reply for this review..."
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => submitReply(review.id)}
                            disabled={submitting || !replyDraft.trim()}
                            className="px-3 py-1.5 text-sm rounded-lg bg-violet-600 text-white disabled:opacity-50"
                          >
                            Send Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyDraft('');
                            }}
                            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSingleAction(review.id, 'approve')}
                        disabled={submitting}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-100 text-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSingleAction(review.id, 'reject')}
                        disabled={submitting}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-amber-100 text-amber-700 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5 inline mr-1" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingId(review.id);
                          setReplyDraft(review.adminReply || '');
                        }}
                        disabled={submitting}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50"
                      >
                        <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSingleAction(review.id, 'delete')}
                        disabled={submitting}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-rose-100 text-rose-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default AdminReviews;
