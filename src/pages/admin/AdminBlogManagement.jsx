import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  Eye,
  ExternalLink,
  Link2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { normalizeProduct } from '../../hooks/useApi';
import { blogAPI, productAPI, uploadAPI } from '../../services/api';
import RichContent from '../../components/content/RichContent';
import {
  BLOG_STATUS_OPTIONS,
  buildBlogExcerpt,
  createEmptyBlogPost,
  formatBlogDate,
  getReadingTimeLabel,
  normalizeBlogPost,
  slugifyBlogPost,
} from '../../utils/blog';
import { sortProductsByIds } from '../../utils/pageBuilder';

const getResponseItems = (response) => response?.data?.data?.items || response?.data?.items || [];
const getResponseData = (response) => response?.data?.data || response?.data || null;
const getApiMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const FieldGroup = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-3xl bg-slate-50 p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm text-slate-500">{title}</span>
      <Icon className="h-4 w-4 text-slate-400" />
    </div>
    <p className="text-3xl font-bold text-slate-950">{value}</p>
  </div>
);

const AdminBlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [selectedLinkedProducts, setSelectedLinkedProducts] = useState([]);
  const [editorPost, setEditorPost] = useState(createEmptyBlogPost());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredProductSearch = useDeferredValue(productSearch);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await blogAPI.getPosts({
        page: '1',
        limit: '100',
        search: deferredSearchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setPosts(getResponseItems(response).map((post) => normalizeBlogPost(post)));
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to load blog posts'));
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [deferredSearchQuery, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    const loadProductResults = async () => {
      try {
        const response = await productAPI.getProducts({
          page: '1',
          limit: '8',
          active: 'true',
          search: deferredProductSearch.trim() || undefined,
        });
        if (!cancelled) {
          setProductResults(getResponseItems(response).map((product) => normalizeProduct(product)));
        }
      } catch {
        if (!cancelled) setProductResults([]);
      }
    };
    loadProductResults();
    return () => {
      cancelled = true;
    };
  }, [deferredProductSearch]);

  useEffect(() => {
    let cancelled = false;
    const loadLinkedProducts = async () => {
      if (editorPost.linkedProductIds.length === 0) {
        setSelectedLinkedProducts([]);
        return;
      }
      try {
        const response = await productAPI.getProducts({
          ids: editorPost.linkedProductIds.join(','),
          active: 'true',
          page: '1',
          limit: String(editorPost.linkedProductIds.length),
        });
        if (!cancelled) {
          setSelectedLinkedProducts(
            sortProductsByIds(
              getResponseItems(response).map((product) => normalizeProduct(product)),
              editorPost.linkedProductIds
            )
          );
        }
      } catch {
        if (!cancelled) setSelectedLinkedProducts([]);
      }
    };
    loadLinkedProducts();
    return () => {
      cancelled = true;
    };
  }, [editorPost.linkedProductIds]);

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((post) => post.status === 'PUBLISHED').length,
    drafts: posts.filter((post) => post.status === 'DRAFT').length,
    featured: posts.filter((post) => post.featured).length,
  }), [posts]);

  const sortedPosts = useMemo(() => (
    [...posts].sort((left, right) => {
      const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
      const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
      return rightTime - leftTime;
    })
  ), [posts]);

  const resetEditor = () => {
    setEditorPost(createEmptyBlogPost());
    setSlugManuallyEdited(false);
    setProductSearch('');
  };

  const openEditor = (post) => {
    setEditorPost(normalizeBlogPost(post));
    setSlugManuallyEdited(true);
    setProductSearch('');
  };

  const handleTitleChange = (value) => {
    setEditorPost((current) => ({
      ...current,
      title: value,
      slug: slugManuallyEdited ? current.slug : slugifyBlogPost(value),
      seo: { ...current.seo, title: current.seo.title || value },
    }));
  };

  const handleSave = async () => {
    if (!editorPost.title.trim()) {
      toast.error('Post title is required');
      return;
    }
    const normalizedSlug = slugifyBlogPost(editorPost.slug || editorPost.title);
    if (!normalizedSlug) {
      toast.error('A valid slug is required');
      return;
    }
    setSavingPost(true);
    const payload = {
      title: editorPost.title.trim(),
      slug: normalizedSlug,
      excerpt: editorPost.excerpt.trim(),
      content: editorPost.content,
      coverImage: editorPost.coverImage || null,
      category: editorPost.category.trim(),
      featured: editorPost.featured,
      linkedProductIds: editorPost.linkedProductIds,
      tags: editorPost.tags,
      status: editorPost.status,
      seo: {
        title: editorPost.seo.title.trim(),
        description: editorPost.seo.description.trim(),
        keywords: editorPost.seo.keywords.trim(),
      },
    };
    try {
      const response = editorPost.id
        ? await blogAPI.updatePost(editorPost.id, payload)
        : await blogAPI.createPost(payload);
      const savedPost = normalizeBlogPost(getResponseData(response));
      setEditorPost(savedPost);
      setSlugManuallyEdited(true);
      await loadPosts();
      toast.success(editorPost.id ? 'Blog post updated' : 'Blog post created');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to save blog post'));
    } finally {
      setSavingPost(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!postId || !window.confirm('Delete this blog post?')) return;
    setDeletingPostId(postId);
    try {
      await blogAPI.deletePost(postId);
      if (editorPost.id === postId) resetEditor();
      await loadPosts();
      toast.success('Blog post deleted');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to delete blog post'));
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'blog');
      const url = getResponseData(response)?.url || '';
      setEditorPost((current) => ({ ...current, coverImage: url }));
      toast.success('Cover image uploaded');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to upload cover image'));
    } finally {
      setUploadingCover(false);
    }
  };

  const toggleLinkedProduct = (productId) => {
    setEditorPost((current) => {
      const exists = current.linkedProductIds.includes(productId);
      return {
        ...current,
        linkedProductIds: exists
          ? current.linkedProductIds.filter((id) => id !== productId)
          : [...current.linkedProductIds, productId],
      };
    });
  };

  const moveLinkedProduct = (productId, direction) => {
    setEditorPost((current) => {
      const nextIds = [...current.linkedProductIds];
      const index = nextIds.indexOf(productId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= nextIds.length) return current;
      const [moved] = nextIds.splice(index, 1);
      nextIds.splice(nextIndex, 0, moved);
      return { ...current, linkedProductIds: nextIds };
    });
  };

  const previewUrl = editorPost.slug ? `/blog/${editorPost.slug}` : '';
  const previewExcerpt = buildBlogExcerpt(editorPost);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Blog control center
              </div>
              <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
                Blog Management
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Create, edit, publish, archive, and delete blog posts. The editor accepts markdown and embedded HTML, and each post can link directly to products from your catalog.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {editorPost.slug ? (
                <Link
                  to={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Link>
              ) : null}
              <button type="button" onClick={resetEditor} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Plus className="h-4 w-4" />
                New Post
              </button>
              <button type="button" onClick={handleSave} disabled={savingPost} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" />
                {savingPost ? 'Saving...' : editorPost.id ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Posts" value={stats.total} icon={BookOpen} />
            <StatCard title="Published" value={stats.published} icon={Calendar} />
            <StatCard title="Drafts" value={stats.drafts} icon={Pencil} />
            <StatCard title="Featured" value={stats.featured} icon={Star} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
          <section className="self-start rounded-[32px] border border-slate-200 bg-white p-5 xl:sticky xl:top-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Posts</h2>
                <p className="mt-1 text-sm text-slate-500">Search and open any post for editing.</p>
              </div>
              <button type="button" onClick={resetEditor} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Create a new blog post">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search blog posts..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white">
                <option value="ALL">All statuses</option>
                {BLOG_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            <div className="mt-5 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
              {loadingPosts ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Loading blog posts...</div>
              ) : sortedPosts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No blog posts found.</div>
              ) : sortedPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => openEditor(post)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${editorPost.id === post.id ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{post.status}</span>
                        {post.featured ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">Featured</span> : null}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-950">{post.title}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{buildBlogExcerpt(post, 120)}</p>
                    </div>
                    {post.coverImage ? <img src={post.coverImage} alt="" className="h-16 w-16 rounded-2xl border border-slate-200 object-cover" /> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                    <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                    <span>{getReadingTimeLabel(post.content)}</span>
                    {post.category ? <span>{post.category}</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{editorPost.id ? 'Edit post' : 'New post'}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">{editorPost.title || 'Untitled blog post'}</h2>
                  <p className="mt-2 text-sm text-slate-500">Markdown is supported. Safe embedded HTML is also rendered in the storefront preview below.</p>
                </div>
                {editorPost.id ? (
                  <button type="button" onClick={() => handleDelete(editorPost.id)} disabled={deletingPostId === editorPost.id} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
                    <Trash2 className="h-4 w-4" />
                    {deletingPostId === editorPost.id ? 'Deleting...' : 'Delete Post'}
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FieldGroup label="Title">
                  <input type="text" value={editorPost.title} onChange={(event) => handleTitleChange(event.target.value)} placeholder="How to style the perfect gift bundle" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
                <FieldGroup label="Slug">
                  <input type="text" value={editorPost.slug} onChange={(event) => { setSlugManuallyEdited(true); setEditorPost((current) => ({ ...current, slug: slugifyBlogPost(event.target.value) })); }} placeholder="style-the-perfect-gift-bundle" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <FieldGroup label="Status">
                  <select value={editorPost.status} onChange={(event) => setEditorPost((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white">
                    {BLOG_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Category">
                  <input type="text" value={editorPost.category} onChange={(event) => setEditorPost((current) => ({ ...current, category: event.target.value }))} placeholder="Guides" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
                <FieldGroup label="Featured">
                  <label className="flex h-[50px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" checked={editorPost.featured} onChange={(event) => setEditorPost((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Highlight this post in the blog listing
                  </label>
                </FieldGroup>
              </div>

              <div className="mt-4">
                <FieldGroup label="Excerpt">
                  <textarea rows={3} value={editorPost.excerpt} onChange={(event) => setEditorPost((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Write a short summary for blog cards and previews." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
              </div>
              <div className="mt-4">
                <FieldGroup label="Content">
                  <textarea rows={16} value={editorPost.content} onChange={(event) => setEditorPost((current) => ({ ...current, content: event.target.value }))} placeholder={`## Start with a strong heading\n\nWrite in markdown, or mix in HTML like:\n<div><strong>Special callout</strong></div>`} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr),280px]">
                <FieldGroup label="Tags">
                  <input type="text" value={editorPost.tags.join(', ')} onChange={(event) => setEditorPost((current) => ({ ...current, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }))} placeholder="gift guide, styling, featured" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
                <FieldGroup label="Cover image">
                  <div className="flex gap-2">
                    <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                      <Upload className="h-4 w-4" />
                      {uploadingCover ? 'Uploading...' : 'Upload cover'}
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => handleCoverUpload(event.target.files?.[0])} />
                    </label>
                    {editorPost.coverImage ? <button type="button" onClick={() => setEditorPost((current) => ({ ...current, coverImage: '' }))} className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50" aria-label="Remove cover image"><X className="h-4 w-4" /></button> : null}
                  </div>
                  {editorPost.coverImage ? <input type="text" value={editorPost.coverImage} onChange={(event) => setEditorPost((current) => ({ ...current, coverImage: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" /> : null}
                </FieldGroup>
              </div>

              {editorPost.coverImage ? <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50"><img src={editorPost.coverImage} alt="" className="h-56 w-full object-cover" /></div> : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FieldGroup label="SEO title">
                  <input type="text" value={editorPost.seo.title} onChange={(event) => setEditorPost((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
                <FieldGroup label="SEO keywords">
                  <input type="text" value={editorPost.seo.keywords} onChange={(event) => setEditorPost((current) => ({ ...current, seo: { ...current.seo, keywords: event.target.value } }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
              </div>
              <div className="mt-4">
                <FieldGroup label="SEO description">
                  <textarea rows={3} value={editorPost.seo.description} onChange={(event) => setEditorPost((current) => ({ ...current, seo: { ...current.seo, description: event.target.value } }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </FieldGroup>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Linked Products</h2>
                  <p className="mt-1 text-sm text-slate-500">Attach catalog items so shoppers can jump from the article into product pages.</p>
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products to link..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" />
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Link2 className="h-4 w-4 text-emerald-600" />Product results</div>
                  <div className="space-y-3">
                    {productResults.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">No products found for this search.</div> : productResults.map((product) => {
                      const linked = editorPost.linkedProductIds.includes(product.id);
                      return (
                        <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                          <img src={product.images?.[0] || ''} alt="" className="h-14 w-14 rounded-2xl border border-slate-100 bg-slate-100 object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.category || 'Uncategorized'}</p>
                          </div>
                          <button type="button" onClick={() => toggleLinkedProduct(product.id)} className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${linked ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>{linked ? 'Remove' : 'Link'}</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><BookOpen className="h-4 w-4 text-emerald-600" />Linked products</div>
                  <div className="space-y-3">
                    {selectedLinkedProducts.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">No linked products yet.</div> : selectedLinkedProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                        <img src={product.images?.[0] || ''} alt="" className="h-14 w-14 rounded-2xl border border-slate-100 bg-slate-100 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>{product.category || 'Uncategorized'}</span>
                            <span>{product.price ? `$${product.price}` : ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveLinkedProduct(product.id, -1)} disabled={index === 0} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => moveLinkedProduct(product.id, 1)} disabled={index === selectedLinkedProducts.length - 1} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => toggleLinkedProduct(product.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-200 text-rose-600 transition hover:bg-rose-50"><X className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Live Preview</h2>
                  <p className="mt-1 text-sm text-slate-500">This preview uses the same markdown and HTML renderer as the public blog post page.</p>
                </div>
                {previewUrl ? (
                  <Link to={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <ExternalLink className="h-4 w-4" />
                    Open storefront page
                  </Link>
                ) : null}
              </div>
              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                {editorPost.coverImage ? <img src={editorPost.coverImage} alt="" className="h-64 w-full object-cover" /> : null}
                <div className="p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span>{editorPost.status}</span>
                    {editorPost.category ? <span>{editorPost.category}</span> : null}
                    <span>{getReadingTimeLabel(editorPost.content)}</span>
                    <span>{formatBlogDate(editorPost.publishedAt || new Date().toISOString())}</span>
                  </div>
                  <h3 className="mt-4 text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>{editorPost.title || 'Preview title'}</h3>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{previewExcerpt}</p>
                  {editorPost.tags.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{editorPost.tags.map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">{tag}</span>)}</div> : null}
                  <div className="mt-8 rounded-[28px] bg-white p-5">
                    <RichContent content={editorPost.content || 'Add post content to preview it here.'} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogManagement;
