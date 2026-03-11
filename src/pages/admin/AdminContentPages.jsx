import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { contentPageAPI } from '../../services/api';
import RichContent from '../../components/content/RichContent';
import {
  buildContentPageSummary,
  CONTENT_PAGE_GUIDE_ITEMS,
  CONTENT_PAGE_PROMPT_TEMPLATE,
  CONTENT_PAGE_STATUS_OPTIONS,
  createEmptyContentPage,
  formatContentPageDate,
  getContentPagePath,
  normalizeContentPage,
  slugifyContentPage,
} from '../../utils/contentPages';

const getResponseItems = (response) => response?.data?.data?.items || response?.data?.items || [];
const getResponseData = (response) => response?.data?.data || response?.data || null;
const getApiMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const FieldGroup = ({ label, children, helperText = '' }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
    {children}
    {helperText ? <p className="mt-2 text-xs leading-5 text-slate-500">{helperText}</p> : null}
  </div>
);

const StatCard = ({ title, value, icon }) => {
  const IconComponent = icon;

  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        {IconComponent ? <IconComponent className="h-4 w-4 text-slate-400" /> : null}
      </div>
      <p className="text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
};

const GuideCard = ({ title, description }) => (
  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
  </div>
);

const AdminContentPages = () => {
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editorPage, setEditorPage] = useState(createEmptyContentPage());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [hasInitialSelection, setHasInitialSelection] = useState(false);
  const [promptRequirements, setPromptRequirements] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadPages = async ({ preserveSelection = true } = {}) => {
    setLoadingPages(true);
    try {
      const response = await contentPageAPI.getPages({
        page: '1',
        limit: '100',
        search: deferredSearchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      const nextPages = getResponseItems(response).map((page) => normalizeContentPage(page));
      setPages(nextPages);

      if (!hasInitialSelection) {
        if (nextPages.length > 0) {
          setEditorPage(nextPages[0]);
          setSlugManuallyEdited(true);
        }
        setHasInitialSelection(true);
      } else if (preserveSelection && editorPage.id) {
        const matchingPage = nextPages.find((page) => page.id === editorPage.id);
        if (matchingPage) {
          setEditorPage(matchingPage);
        }
      }
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to load content pages'));
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: pages.length,
    published: pages.filter((page) => page.status === 'PUBLISHED').length,
    drafts: pages.filter((page) => page.status === 'DRAFT').length,
    archived: pages.filter((page) => page.status === 'ARCHIVED').length,
  }), [pages]);

  const sortedPages = useMemo(() => (
    [...pages].sort((left, right) => {
      const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
      const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
      return rightTime - leftTime;
    })
  ), [pages]);

  const promptText = useMemo(() => (
    CONTENT_PAGE_PROMPT_TEMPLATE.replace('[user requirements here]', promptRequirements.trim() || 'Add your store-specific requirements here.')
  ), [promptRequirements]);

  const previewUrl = editorPage.slug ? getContentPagePath(editorPage.slug) : '';

  const resetEditor = () => {
    setEditorPage(createEmptyContentPage());
    setSlugManuallyEdited(false);
  };

  const openEditor = (page) => {
    setEditorPage(normalizeContentPage(page));
    setSlugManuallyEdited(true);
  };

  const handleTitleChange = (value) => {
    setEditorPage((current) => ({
      ...current,
      title: value,
      slug: slugManuallyEdited ? current.slug : slugifyContentPage(value),
      metaTitle: current.metaTitle || value,
    }));
  };

  const handleSave = async () => {
    if (!editorPage.title.trim()) {
      toast.error('Page title is required');
      return;
    }

    const normalizedSlug = slugifyContentPage(editorPage.slug || editorPage.title);
    if (!normalizedSlug) {
      toast.error('A valid slug is required');
      return;
    }

    setSavingPage(true);
    try {
      const payload = {
        title: editorPage.title.trim(),
        slug: normalizedSlug,
        metaTitle: editorPage.metaTitle.trim(),
        metaDescription: editorPage.metaDescription.trim(),
        content: editorPage.content,
        status: editorPage.status,
      };

      const response = editorPage.id
        ? await contentPageAPI.updatePage(editorPage.id, payload)
        : await contentPageAPI.createPage(payload);

      const savedPage = normalizeContentPage(getResponseData(response));
      setEditorPage(savedPage);
      setSlugManuallyEdited(true);
      await loadPages({ preserveSelection: false });
      toast.success(editorPage.id ? 'Content page updated' : 'Content page created');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to save content page'));
    } finally {
      setSavingPage(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (!pageId || !window.confirm('Delete this content page?')) {
      return;
    }

    setDeletingPageId(pageId);
    try {
      await contentPageAPI.deletePage(pageId);
      const remainingPages = pages.filter((page) => page.id !== pageId);
      setPages(remainingPages);

      if (editorPage.id === pageId) {
        if (remainingPages.length > 0) {
          openEditor(remainingPages[0]);
        } else {
          resetEditor();
        }
      }

      toast.success('Content page deleted');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to delete content page'));
    } finally {
      setDeletingPageId(null);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      toast.success('Prompt copied');
    } catch {
      toast.error('Failed to copy prompt');
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50">
      <div className="border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Content section
              </div>
              <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
                Content Pages
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Create editable storefront pages with raw HTML and markdown support. The shared navbar and footer stay in place while this system controls only the main page body.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {previewUrl ? (
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
              <button
                type="button"
                onClick={resetEditor}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                New Page
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={savingPage}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {savingPage ? 'Saving...' : editorPage.id ? 'Save Changes' : 'Create Page'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Pages" value={stats.total} icon={FileText} />
            <StatCard title="Published" value={stats.published} icon={BookOpen} />
            <StatCard title="Drafts" value={stats.drafts} icon={Pencil} />
            <StatCard title="Archived" value={stats.archived} icon={Trash2} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
          <section className="self-start rounded-[32px] border border-slate-200 bg-white p-5 xl:sticky xl:top-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Pages</h2>
                <p className="mt-1 text-sm text-slate-500">Open any content page or create a new one.</p>
              </div>
              <button
                type="button"
                onClick={resetEditor}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Create a new content page"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search pages..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
              >
                <option value="ALL">All statuses</option>
                {CONTENT_PAGE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
              {loadingPages ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Loading content pages...
                </div>
              ) : sortedPages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No content pages found.
                </div>
              ) : sortedPages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => openEditor(page)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    editorPage.id === page.id
                      ? 'border-sky-300 bg-sky-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {page.status}
                      </span>
                      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-950">{page.title}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{buildContentPageSummary(page)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      /{page.slug}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                    <span>{formatContentPageDate(page.updatedAt || page.createdAt)}</span>
                    {page.metaTitle ? <span>SEO ready</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                    {editorPage.id ? 'Edit page' : 'New page'}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {editorPage.title || 'Untitled content page'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Use markdown, raw HTML, or both. Inline CSS is preserved so you can style the page body directly.
                  </p>
                </div>
                {editorPage.id ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editorPage.id)}
                    disabled={deletingPageId === editorPage.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingPageId === editorPage.id ? 'Deleting...' : 'Delete Page'}
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FieldGroup label="Title">
                  <input
                    type="text"
                    value={editorPage.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="About"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </FieldGroup>
                <FieldGroup label="Slug" helperText={previewUrl ? `Storefront URL: ${previewUrl}` : 'Create a slug to generate a storefront URL.'}>
                  <input
                    type="text"
                    value={editorPage.slug}
                    onChange={(event) => {
                      setSlugManuallyEdited(true);
                      setEditorPage((current) => ({ ...current, slug: slugifyContentPage(event.target.value) }));
                    }}
                    placeholder="about"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </FieldGroup>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FieldGroup label="Status">
                  <select
                    value={editorPage.status}
                    onChange={(event) => setEditorPage((current) => ({ ...current, status: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                  >
                    {CONTENT_PAGE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup label="Meta Title">
                  <input
                    type="text"
                    value={editorPage.metaTitle}
                    onChange={(event) => setEditorPage((current) => ({ ...current, metaTitle: event.target.value }))}
                    placeholder="About Us | Store Name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </FieldGroup>
              </div>

              <div className="mt-4">
                <FieldGroup label="Meta Description">
                  <textarea
                    rows={3}
                    value={editorPage.metaDescription}
                    onChange={(event) => setEditorPage((current) => ({ ...current, metaDescription: event.target.value }))}
                    placeholder="Short SEO summary for search engines and social previews."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </FieldGroup>
              </div>

              <div className="mt-4">
                <FieldGroup
                  label="HTML / Markdown Content"
                  helperText="Only the main content area is rendered from this field. The site header and footer are injected automatically around it."
                >
                  <textarea
                    rows={18}
                    value={editorPage.content}
                    onChange={(event) => setEditorPage((current) => ({ ...current, content: event.target.value }))}
                    placeholder={`<section style="padding:48px 0;text-align:center;">\n  <h1 style="font-size:48px;">Build your page here</h1>\n</section>\n\n## Markdown still works\n\n![Hero image](https://example.com/image.jpg)`}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                  />
                </FieldGroup>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Live Preview</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      This preview renders the same markdown and raw HTML pipeline used on the storefront page.
                    </p>
                  </div>
                  {previewUrl ? (
                    <Link
                      to={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open storefront page
                    </Link>
                  ) : null}
                </div>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                  <div className="border-b border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
                    Store header and footer are not shown in this card, but they remain fixed on the live page.
                  </div>
                  <div className="p-6 lg:p-8">
                    <RichContent
                      content={editorPage.content || `# ${editorPage.title || 'Preview page'}\n\nAdd content to see it here.`}
                      containerClassName="mx-auto max-w-6xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <BookOpen className="h-4 w-4 text-sky-600" />
                    Guide
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use this as a quick reference while building raw HTML pages inside the shared storefront layout.
                  </p>
                  <div className="mt-5 space-y-3">
                    {CONTENT_PAGE_GUIDE_ITEMS.map((item) => (
                      <GuideCard key={item.title} title={item.title} description={item.description} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Wand2 className="h-4 w-4 text-sky-600" />
                    AI Prompt Generator
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Add your page requirements, then copy the generated prompt for ChatGPT or any other AI tool.
                  </p>

                  <div className="mt-5">
                    <FieldGroup label="Your Requirements">
                      <textarea
                        rows={4}
                        value={promptRequirements}
                        onChange={(event) => setPromptRequirements(event.target.value)}
                        placeholder="Describe the page section, tone, layout needs, content blocks, and SEO goals."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
                      />
                    </FieldGroup>
                  </div>

                  <div className="mt-4">
                    <FieldGroup label="Generated Prompt">
                      <textarea
                        rows={12}
                        readOnly
                        value={promptText}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-sm text-slate-700 outline-none"
                      />
                    </FieldGroup>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPages;
