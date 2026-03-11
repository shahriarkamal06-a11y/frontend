import { Fragment, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Grid3X3,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryAPI } from '../../services/api';
import { normalizeCategory } from '../../hooks/useApi';
import {
  buildCategoryTree,
  flattenCategoryTree,
  getCategoryDescendants,
  getCategoryOptionLabel,
} from '../../utils/categoryTree';

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const AdminCategories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryAPI.getCategories({ limit: 500, page: 1 });
      const items = response?.data?.data?.items || [];
      setCategories(items.map(normalizeCategory));
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error(getErrorMessage(error, 'Failed to load categories'));
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatCategoryTree = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);

  const filteredCategoryTree = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryTree;

    const filterNodes = (nodes) => nodes
      .map((node) => {
        const matches = [
          node.name,
          node.description,
          node.slug,
        ].some((value) => String(value || '').toLowerCase().includes(q));
        const children = filterNodes(node.children || []);

        if (matches || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean);

    return filterNodes(categoryTree);
  }, [categoryTree, searchQuery]);

  const filteredFlatCategories = useMemo(
    () => flattenCategoryTree(filteredCategoryTree),
    [filteredCategoryTree]
  );

  const topLevelCategories = categoryTree;

  const subcategoryCount = categories.filter((c) => c.parentId).length;
  const activeCount = categories.filter((c) => c.isActive).length;

  const toggleExpand = (categoryId) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    setExpandedCategories(next);
  };

  const handleToggleActive = async (category) => {
    try {
      await categoryAPI.updateCategory(category.id, { isActive: !category.isActive });
      setCategories((prev) =>
        prev.map((item) =>
          item.id === category.id ? { ...item, isActive: !category.isActive } : item
        )
      );
      toast.success('Category updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update category'));
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Delete "${category.name}"?`)) return;

    try {
      await categoryAPI.deleteCategory(category.id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete category'));
    }
  };

  const handleSaveCategory = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      slug: slugify(formData.slug || formData.name),
      description: formData.description || null,
      parentId: formData.parentId || null,
      imageUrl: formData.imageUrl || null,
      icon: formData.icon || null,
      sortOrder: Number(formData.sortOrder || 0),
      isActive: !!formData.isActive,
    };

    try {
      if (editingCategory) {
        const response = await categoryAPI.updateCategory(editingCategory.id, payload);
        const updated = normalizeCategory(response?.data?.data || response?.data);
        setCategories((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success('Category updated');
      } else {
        const response = await categoryAPI.createCategory(payload);
        const created = normalizeCategory(response?.data?.data || response?.data);
        setCategories((prev) => [...prev, created]);
        toast.success('Category created');
      }
      setShowModal(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save category'));
    }
  };

  const stats = [
    { label: 'Total Categories', value: categories.length, className: 'text-violet-600' },
    { label: 'Subcategories', value: subcategoryCount, className: 'text-blue-600' },
    { label: 'Active', value: activeCount, className: 'text-emerald-600' },
    { label: 'Top Level', value: topLevelCategories.length, className: 'text-amber-600' },
  ];

  const forceExpandAll = searchQuery.trim().length > 0;

  const categoryOptions = useMemo(() => {
    if (!editingCategory) return flatCategoryTree;
    const descendants = getCategoryDescendants(categories, editingCategory.id);
    const excludedIds = new Set([editingCategory.id, ...descendants.map((item) => item.id)]);
    return flatCategoryTree.filter((item) => !excludedIds.has(item.id));
  }, [categories, editingCategory, flatCategoryTree]);

  const renderCategoryRows = (nodes, depth = 0) => nodes.map((category) => {
    const hasChildren = (category.children || []).length > 0;
    const isExpanded = forceExpandAll || expandedCategories.has(category.id);
    const indent = depth * 20;
    const iconSizeClass = depth === 0 ? 'h-10 w-10' : 'h-8 w-8';
    const iconShellClass = depth === 0
      ? 'rounded-xl overflow-hidden'
      : 'rounded-lg border border-slate-200 bg-white';
    const iconBackgroundClass = depth === 0 ? 'text-white bg-violet-500' : 'text-slate-400 bg-white';

    return (
      <Fragment key={category.id}>
        <tr className={depth > 0 ? 'bg-slate-50/50' : 'hover:bg-slate-50/50 transition-colors'}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3" style={{ marginLeft: indent }}>
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
                disabled={!hasChildren}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )
                ) : (
                  <span className="block h-4 w-4" />
                )}
              </button>
              <div className={`${iconSizeClass} ${iconShellClass} flex items-center justify-center ${iconBackgroundClass}`}>
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
                ) : depth === 0 ? (
                  <Folder className="h-5 w-5" />
                ) : (
                  <FolderOpen className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{category.name}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{category.description || '-'}</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <code className="text-xs bg-slate-100 px-2 py-1 rounded">{category.slug}</code>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-slate-900">{hasChildren ? category.children.length : '-'}</span>
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => handleToggleActive(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {category.isActive ? 'Active' : 'Inactive'}
            </button>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setShowModal(true);
                }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(category)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && renderCategoryRows(category.children, depth + 1)}
      </Fragment>
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Manage product categories and hierarchy</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'tree' ? 'bg-violet-100 text-violet-600' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-slate-400'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 hover:from-violet-700 hover:to-indigo-700 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.className}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          />
        </div>
      </div>

      {viewMode === 'tree' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Children</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategoryTree.length > 0 ? (
                  renderCategoryRows(filteredCategoryTree)
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFlatCategories.map((category) => {
            const childrenCount = (category.children || []).length;
            const depthLabel = category.pathLabel || category.name;
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-24 bg-gradient-to-r from-violet-500/90 to-indigo-500/90 relative">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Folder className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{depthLabel}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{category.description || '-'}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-slate-600">{childrenCount} sub</span>
                    <span className="text-slate-400">{category.slug}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={editingCategory}
            categoryOptions={categoryOptions}
            onClose={() => {
              setShowModal(false);
              setEditingCategory(null);
            }}
            onSave={handleSaveCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryModal = ({ category, categoryOptions, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    parentId: category?.parentId || '',
    imageUrl: category?.imageUrl || '',
    icon: category?.icon || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Parent Category (optional)</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">None (Top Level)</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id} title={option.pathLabel || option.name}>
                  {getCategoryOptionLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Icon (optional)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                placeholder="Folder"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort Order</label>
              <input
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL (optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
              placeholder="https://..."
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
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminCategories;
