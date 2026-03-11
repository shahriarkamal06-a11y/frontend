import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { storeAPI } from '../../services/api';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const formatDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString();
};

const buildStoreUrl = (domain) => {
  if (!domain) return '';
  if (/^https?:\/\//i.test(domain)) return domain;
  return `https://${domain}`;
};

const AdminStoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const loadStores = async (page = pagination.page, pageLimit = limit) => {
    try {
      setIsLoading(true);
      const response = await storeAPI.listStores({ page, limit: pageLimit });
      const payload = response?.data?.data || {};
      setStores(Array.isArray(payload.items) ? payload.items : []);
      setPagination(payload.pagination || { page, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load stores'));
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStores(1, limit);
  }, [limit]);

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((store) =>
      [store.name, store.slug, store.domain, store.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [stores, searchQuery]);

  const stats = useMemo(() => {
    const activeCount = stores.filter((store) => store.isActive).length;
    const withDomains = stores.filter((store) => store.domain).length;
    return [
      { label: 'Total Stores', value: pagination.total || stores.length, className: 'text-violet-600' },
      { label: 'Active', value: activeCount, className: 'text-emerald-600' },
      { label: 'Domains Linked', value: withDomains, className: 'text-blue-600' },
      { label: 'Page Size', value: limit, className: 'text-amber-600' },
    ];
  }, [stores, pagination.total, limit]);

  const handleDelete = async (store) => {
    if (!confirm(`Delete "${store.name}"? This cannot be undone.`)) return;
    try {
      await storeAPI.deleteStore(store.id);
      toast.success('Store deleted');
      loadStores(pagination.page, limit);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete store'));
    }
  };

  const handleToggleActive = async (store) => {
    try {
      await storeAPI.updateStore(store.id, { isActive: !store.isActive });
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, isActive: !item.isActive } : item))
      );
      toast.success('Store updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update store'));
    }
  };

  const handleSaveStore = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      slug: slugify(formData.slug || formData.name),
      domain: formData.domain || null,
      email: formData.email || null,
      phone: formData.phone || null,
      currency: formData.currency || 'USD',
      timezone: formData.timezone || 'UTC',
      description: formData.description || null,
      isActive: formData.isActive,
    };

    try {
      if (editingStore) {
        await storeAPI.updateStore(editingStore.id, payload);
        toast.success('Store updated');
      } else {
        await storeAPI.createStore(payload);
        toast.success('Store created');
      }
      setShowModal(false);
      setEditingStore(null);
      loadStores(pagination.page, limit);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save store'));
    }
  };

  const handleCopyId = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Store ID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePageChange = (nextPage) => {
    loadStores(nextPage, limit);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
          <p className="text-slate-500 mt-1">Create and manage all storefronts</p>
        </div>
        <button
          onClick={() => {
            setEditingStore(null);
            setShowModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 hover:from-violet-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4" /> New Store
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.className}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Rows</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4">Store</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                          {(store.name || 'S').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{store.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">{store.slug}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(store.id)}
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600"
                            >
                              <Copy className="h-3 w-3" /> ID
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {store.domain ? (
                        <a
                          href={buildStoreUrl(store.domain)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                        >
                          {store.domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(store)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          store.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {store.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(store.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingStore(store);
                            setShowModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(store)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                    No stores found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <StoreModal
            store={editingStore}
            onClose={() => {
              setShowModal(false);
              setEditingStore(null);
            }}
            onSave={handleSaveStore}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StoreModal = ({ store, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: store?.name || '',
    slug: store?.slug || '',
    domain: store?.domain || '',
    email: store?.email || '',
    phone: store?.phone || '',
    currency: store?.currency || 'USD',
    timezone: store?.timezone || 'UTC',
    description: store?.description || '',
    isActive: store?.isActive ?? true,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {store ? 'Edit Store' : 'Create Store'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: prev.slug ? prev.slug : slugify(e.target.value),
                }))
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Domain</label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              placeholder="store.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
              rows="2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-violet-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl"
            >
              {store ? 'Save Changes' : 'Create Store'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminStoreManagement;
