import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CopyPlus, Eye, FilePlus2, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { normalizeProduct } from '../../hooks/useApi';
import { pageAPI, productAPI } from '../../services/api';
import PageBuilderSidebar from '../../components/page-builder/admin/PageBuilderSidebar';
import PageBuilderBlockEditor from '../../components/page-builder/admin/PageBuilderBlockEditor';
import PageBuilderCanvasEditor from '../../components/page-builder/admin/PageBuilderCanvasEditor';
import {
  BLOCK_ICONS,
  PageStatusBadge,
  STATUS_OPTIONS,
  getBlockSummary,
  inputClassName,
  labelClassName,
} from '../../components/page-builder/admin/pageBuilderAdmin';
import {
  PAGE_BLOCK_LIBRARY,
  createEmptyPageRecord,
  createPageBuilderBlock,
  extractLinkedProductIds,
  getPagePath,
  normalizePageRecord,
  slugifyPagePath,
  sortProductsByIds,
} from '../../utils/pageBuilder';

const clonePage = (page) => normalizePageRecord(JSON.parse(JSON.stringify(page)));
const getApiMessage = (error, fallback) => error?.response?.data?.message || fallback;
const getResponseItems = (response) => response?.data?.data?.items || response?.data?.items || [];
const getPageSignature = (page) => JSON.stringify(normalizePageRecord(page || createEmptyPageRecord()));
const sortPageRecords = (records, sortKey) => {
  const items = [...records];

  if (sortKey === 'title-asc') {
    return items.sort((left, right) => left.title.localeCompare(right.title));
  }

  if (sortKey === 'title-desc') {
    return items.sort((left, right) => right.title.localeCompare(left.title));
  }

  if (sortKey === 'slug-asc') {
    return items.sort((left, right) => left.slug.localeCompare(right.slug));
  }

  return items.sort((left, right) => {
    const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
};

const getPageValidation = (page) => {
  const normalizedSlug = slugifyPagePath(page?.slug || '');
  const errors = {
    title: !page?.title?.trim() ? 'Page title is required.' : '',
    slug: !normalizedSlug ? 'A valid page slug is required.' : '',
    content: !page?.content?.length ? 'Add at least one content block before saving.' : '',
  };

  return {
    normalizedSlug,
    errors,
    messages: Object.values(errors).filter(Boolean),
    hasErrors: Object.values(errors).some(Boolean),
  };
};

const ensureUniqueLocalSlug = (baseSlug, pages, currentId = null) => {
  const normalizedBaseSlug = slugifyPagePath(baseSlug) || 'page-copy';
  const existingSlugs = new Set(
    pages
      .filter((page) => page.id !== currentId)
      .map((page) => page.slug)
      .filter(Boolean)
  );

  if (!existingSlugs.has(normalizedBaseSlug)) {
    return normalizedBaseSlug;
  }

  let counter = 2;
  let nextSlug = `${normalizedBaseSlug}-${counter}`;

  while (existingSlugs.has(nextSlug)) {
    counter += 1;
    nextSlug = `${normalizedBaseSlug}-${counter}`;
  }

  return nextSlug;
};

const getBlockLabel = (type) => PAGE_BLOCK_LIBRARY.find((entry) => entry.type === type)?.label || type;

const duplicateBlockRecord = (block) => {
  const nextBlock = createPageBuilderBlock(block.type);
  nextBlock.data = JSON.parse(JSON.stringify(block.data || nextBlock.data));
  return nextBlock;
};

const InspectorTabButton = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
      active
        ? 'bg-slate-950 text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

const AdminContent = () => {
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState(null);
  const [pageSearch, setPageSearch] = useState('');
  const [pageStatusFilter, setPageStatusFilter] = useState('ALL');
  const [pageSort, setPageSort] = useState('updated-desc');
  const [editorPage, setEditorPage] = useState(null);
  const [editorBaseline, setEditorBaseline] = useState(createEmptyPageRecord());
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [loadingProductResults, setLoadingProductResults] = useState(false);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [inspectorTab, setInspectorTab] = useState('page');
  const [draggedSidebarBlockType, setDraggedSidebarBlockType] = useState(null);

  const deferredProductSearch = useDeferredValue(productSearch);

  const pageStats = useMemo(() => ({
    total: pages.length,
    published: pages.filter((page) => page.status === 'PUBLISHED').length,
    draft: pages.filter((page) => page.status === 'DRAFT').length,
    archived: pages.filter((page) => page.status === 'ARCHIVED').length,
    homepage: pages.filter((page) => page.isHomepage).length,
  }), [pages]);

  const filteredPages = useMemo(() => {
    const needle = pageSearch.trim().toLowerCase();
    const nextPages = pages.filter((page) => {
      const matchesSearch = !needle || (
        page.title.toLowerCase().includes(needle)
        || page.slug.toLowerCase().includes(needle)
        || page.status.toLowerCase().includes(needle)
      );
      const matchesStatus = pageStatusFilter === 'ALL' || page.status === pageStatusFilter;
      return matchesSearch && matchesStatus;
    });

    return sortPageRecords(nextPages, pageSort);
  }, [pageSearch, pageSort, pageStatusFilter, pages]);

  const activeBlock = useMemo(() => (
    editorPage?.content.find((block) => block.id === selectedBlockId) || editorPage?.content[0] || null
  ), [editorPage, selectedBlockId]);
  const activeBlockIndex = useMemo(() => (
    editorPage?.content.findIndex((block) => block.id === activeBlock?.id) ?? -1
  ), [activeBlock?.id, editorPage]);

  const linkedProductIds = useMemo(() => (
    extractLinkedProductIds(editorPage?.content || [])
  ), [editorPage]);

  const pageValidation = useMemo(() => getPageValidation(editorPage), [editorPage]);
  const persistedPreviewPage = useMemo(() => {
    const normalizedSlug = pageValidation.normalizedSlug;
    if (!normalizedSlug) {
      return null;
    }

    if (editorPage?.id) {
      return editorPage;
    }

    return pages.find((page) => page.slug === normalizedSlug) || null;
  }, [editorPage, pageValidation.normalizedSlug, pages]);
  const isDirty = useMemo(() => (
    editorPage ? getPageSignature(editorPage) !== getPageSignature(editorBaseline) : false
  ), [editorBaseline, editorPage]);
  const isUnsavedNewPage = Boolean(
    editorPage
    && !editorPage.id
    && (
      editorPage.title.trim()
      || editorPage.slug.trim()
      || isDirty
    )
  );
  const hasPendingChanges = isDirty || isUnsavedNewPage;
  const draftPage = hasPendingChanges ? editorPage : null;
  const canPreviewPage = Boolean(persistedPreviewPage && pageValidation.normalizedSlug);

  const openPageInEditor = (page) => {
    const nextPage = clonePage(page);
    setEditorPage(nextPage);
    setEditorBaseline(clonePage(nextPage));
    setSelectedBlockId(nextPage.content[0]?.id || null);
    setProductSearch('');
    setInspectorTab('page');
  };

  const createFreshPage = () => {
    const nextPage = createEmptyPageRecord();
    setEditorPage(nextPage);
    setEditorBaseline(clonePage(nextPage));
    setSelectedBlockId(nextPage.content[0]?.id || null);
    setProductSearch('');
    setInspectorTab('page');
  };

  const confirmEditorTransition = (targetLabel) => {
    if (!hasPendingChanges) {
      return true;
    }

    return window.confirm(`You have unsaved changes. Discard them and ${targetLabel}?`);
  };

  useEffect(() => {
    const loadPages = async () => {
      setLoadingPages(true);

      try {
        const response = await pageAPI.getPages({ page: '1', limit: '100' });
        const items = getResponseItems(response).map((page) => normalizePageRecord(page));
        setPages(items);

        if (items.length > 0) {
          const nextPage = clonePage(items[0]);
          setEditorPage(nextPage);
          setEditorBaseline(clonePage(nextPage));
          setSelectedBlockId(nextPage.content[0]?.id || null);
          setProductSearch('');
        } else {
          const nextPage = createEmptyPageRecord();
          setEditorPage(nextPage);
          setEditorBaseline(clonePage(nextPage));
          setSelectedBlockId(nextPage.content[0]?.id || null);
          setProductSearch('');
        }
      } catch (error) {
        toast.error(getApiMessage(error, 'Failed to load pages'));
      } finally {
        setLoadingPages(false);
      }
    };

    loadPages();
  }, []);

  useEffect(() => {
    if (!editorPage?.content?.length) {
      setSelectedBlockId(null);
      return;
    }

    if (!editorPage.content.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(editorPage.content[0].id);
    }
  }, [editorPage, selectedBlockId]);

  useEffect(() => {
    let cancelled = false;

    const loadLinkedProducts = async () => {
      if (linkedProductIds.length === 0) {
        setLinkedProducts([]);
        return;
      }

      try {
        const response = await productAPI.getProducts({
          ids: linkedProductIds.join(','),
          active: 'true',
          limit: String(linkedProductIds.length),
          page: '1',
        });

        if (!cancelled) {
          setLinkedProducts(sortProductsByIds(getResponseItems(response).map(normalizeProduct), linkedProductIds));
        }
      } catch {
        if (!cancelled) {
          setLinkedProducts([]);
        }
      }
    };

    loadLinkedProducts();
    return () => {
      cancelled = true;
    };
  }, [linkedProductIds]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      if (activeBlock?.type !== 'productGrid') {
        setProductResults([]);
        setLoadingProductResults(false);
        return;
      }

      setLoadingProductResults(true);
      try {
        const response = await productAPI.getProducts({
          page: '1',
          limit: '8',
          active: 'true',
          search: deferredProductSearch || undefined,
        });

        if (!cancelled) {
          setProductResults(getResponseItems(response).map(normalizeProduct));
        }
      } catch {
        if (!cancelled) {
          setProductResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProductResults(false);
        }
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [activeBlock?.type, deferredProductSearch]);

  const selectPage = (page) => {
    if (!page || (editorPage?.id && editorPage.id === page.id)) {
      return;
    }

    if (!confirmEditorTransition('open another page')) {
      return;
    }

    openPageInEditor(page);
  };

  const selectBlock = (blockId) => {
    setSelectedBlockId(blockId);
    setInspectorTab('block');
  };

  const updateEditorPage = (updater) => {
    setEditorPage((current) => (current ? updater(current) : current));
  };

  const updateBlockData = (blockId, partialData) => {
    updateEditorPage((current) => ({
      ...current,
      content: current.content.map((block) => (
        block.id === blockId ? { ...block, data: { ...block.data, ...partialData } } : block
      )),
    }));
  };

  const moveBlockToIndex = (blockId, targetIndex) => {
    updateEditorPage((current) => {
      const currentIndex = current.content.findIndex((block) => block.id === blockId);
      if (currentIndex < 0) {
        return current;
      }

      const nextBlocks = [...current.content];
      const [movedBlock] = nextBlocks.splice(currentIndex, 1);
      let insertIndex = targetIndex;

      if (targetIndex > currentIndex) {
        insertIndex -= 1;
      }

      insertIndex = Math.max(0, Math.min(insertIndex, nextBlocks.length));
      nextBlocks.splice(insertIndex, 0, movedBlock);

      return { ...current, content: nextBlocks };
    });
  };

  const handleTitleChange = (value) => {
    updateEditorPage((current) => {
      const suggestedSlug = slugifyPagePath(current.title);
      const shouldUpdateSlug = !current.id && (!current.slug || current.slug === suggestedSlug);

      return {
        ...current,
        title: value,
        slug: shouldUpdateSlug ? slugifyPagePath(value) : current.slug,
      };
    });
  };

  const handleAddBlock = (type, insertionIndex = null) => {
    const nextBlock = createPageBuilderBlock(type);
    updateEditorPage((current) => {
      const nextBlocks = [...current.content];
      let nextIndex = nextBlocks.length;

      if (typeof insertionIndex === 'number') {
        nextIndex = Math.max(0, Math.min(insertionIndex, nextBlocks.length));
      } else if (selectedBlockId) {
        const selectedIndex = nextBlocks.findIndex((block) => block.id === selectedBlockId);
        nextIndex = selectedIndex >= 0 ? selectedIndex + 1 : nextBlocks.length;
      }

      nextBlocks.splice(nextIndex, 0, nextBlock);
      return { ...current, content: nextBlocks };
    });
    setSelectedBlockId(nextBlock.id);
    setInspectorTab('block');
    return nextBlock.id;
  };

  const handleMoveBlock = (blockId, direction) => {
    updateEditorPage((current) => {
      const index = current.content.findIndex((block) => block.id === blockId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.content.length) {
        return current;
      }

      const nextBlocks = [...current.content];
      const [movedBlock] = nextBlocks.splice(index, 1);
      nextBlocks.splice(nextIndex, 0, movedBlock);
      return { ...current, content: nextBlocks };
    });
  };

  const handleRemoveBlock = (blockId) => {
    updateEditorPage((current) => ({ ...current, content: current.content.filter((block) => block.id !== blockId) }));
  };

  const handleDuplicateBlock = (blockId) => {
    let duplicatedBlockId = null;

    updateEditorPage((current) => {
      const index = current.content.findIndex((block) => block.id === blockId);
      if (index < 0) {
        return current;
      }

      const nextBlocks = [...current.content];
      const duplicatedBlock = duplicateBlockRecord(nextBlocks[index]);
      duplicatedBlockId = duplicatedBlock.id;
      nextBlocks.splice(index + 1, 0, duplicatedBlock);
      return { ...current, content: nextBlocks };
    });

    if (duplicatedBlockId) {
      setSelectedBlockId(duplicatedBlockId);
      setInspectorTab('block');
    }
  };

  const handleToggleProduct = (productId) => {
    if (!activeBlock || activeBlock.type !== 'productGrid') return;
    const currentIds = activeBlock.data?.productIds || [];
    const nextIds = currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];

    updateBlockData(activeBlock.id, { productIds: nextIds });
  };

  const handleMoveSelectedProduct = (productId, direction) => {
    if (!activeBlock || activeBlock.type !== 'productGrid') return;
    const nextIds = [...(activeBlock.data?.productIds || [])];
    const index = nextIds.indexOf(productId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= nextIds.length) return;
    const [moved] = nextIds.splice(index, 1);
    nextIds.splice(nextIndex, 0, moved);
    updateBlockData(activeBlock.id, { productIds: nextIds });
  };

  const handleAddFeatureItem = () => {
    if (!activeBlock || activeBlock.type !== 'featureList') return;
    updateBlockData(activeBlock.id, {
      items: [
        ...(activeBlock.data?.items || []),
        {
          id: `feature-${Math.random().toString(36).slice(2, 10)}`,
          title: 'New feature',
          description: 'Describe the value of this item.',
        },
      ],
    });
  };

  const handleRemoveFeatureItem = (featureId) => {
    if (!activeBlock || activeBlock.type !== 'featureList') return;
    updateBlockData(activeBlock.id, {
      items: (activeBlock.data?.items || []).filter((item) => item.id !== featureId),
    });
  };

  const handleStartNewPage = () => {
    if (!confirmEditorTransition('start a new page')) {
      return;
    }

    createFreshPage();
  };

  const handleDiscardChanges = () => {
    if (!editorPage) {
      return;
    }

    if (!hasPendingChanges) {
      return;
    }

    if (!window.confirm('Discard the current changes?')) {
      return;
    }

    if (editorPage.id) {
      const savedPage = pages.find((page) => page.id === editorPage.id) || editorBaseline;
      openPageInEditor(savedPage);
      toast.success('Changes discarded');
      return;
    }

    if (pages.length > 0) {
      openPageInEditor(pages[0]);
    } else {
      createFreshPage();
    }

    toast.success('Draft discarded');
  };

  const handleDuplicatePage = (sourcePage = editorPage) => {
    if (!sourcePage) {
      return;
    }

    if (
      hasPendingChanges
      && editorPage
      && sourcePage.id
      && sourcePage.id !== editorPage.id
      && !confirmEditorTransition('create a duplicate draft from another page')
    ) {
      return;
    }

    const baseTitle = sourcePage.title.trim() || 'Untitled page';
    const nextTitle = `${baseTitle} Copy`;
    const nextSlug = ensureUniqueLocalSlug(
      `${sourcePage.slug || slugifyPagePath(baseTitle) || 'page'}-copy`,
      pages,
      sourcePage.id
    );
    const nextPage = clonePage({
      ...sourcePage,
      id: null,
      title: nextTitle,
      slug: nextSlug,
      status: 'DRAFT',
      isHomepage: false,
      createdAt: null,
      updatedAt: null,
    });

    setEditorPage(nextPage);
    setEditorBaseline(clonePage(nextPage));
    setSelectedBlockId(nextPage.content[0]?.id || null);
    setProductSearch('');
    setInspectorTab('page');
    toast.success('Draft copy created');
  };

  const handleOpenPreview = (targetPage = editorPage) => {
    const normalizedSlug = slugifyPagePath(targetPage?.slug || targetPage?.title || '');
    const savedTargetPage = targetPage?.id
      ? targetPage
      : pages.find((page) => page.slug === normalizedSlug);

    if (!normalizedSlug) {
      toast.error('Add a valid page slug before opening preview.');
      return;
    }

    if (!savedTargetPage) {
      toast.error('Save the page first to open the storefront preview.');
      return;
    }

    window.open(getPagePath(normalizedSlug), '_blank', 'noopener,noreferrer');
  };

  const handleSavePage = async () => {
    if (pageValidation.errors.title) return toast.error(pageValidation.errors.title);
    if (pageValidation.errors.slug) return toast.error(pageValidation.errors.slug);
    if (pageValidation.errors.content) return toast.error(pageValidation.errors.content);

    const isUpdating = Boolean(editorPage?.id);
    setSavingPage(true);
    try {
      const payload = {
        title: editorPage.title.trim(),
        slug: pageValidation.normalizedSlug,
        status: editorPage.status,
        template: editorPage.template,
        isHomepage: editorPage.isHomepage,
        seo: {
          title: editorPage.seo.title.trim(),
          description: editorPage.seo.description.trim(),
          keywords: editorPage.seo.keywords.trim(),
        },
        content: editorPage.content,
      };

      const response = editorPage.id
        ? await pageAPI.updatePage(editorPage.id, payload)
        : await pageAPI.createPage(payload);

      const savedPage = normalizePageRecord(response?.data?.data);
      setPages((current) => {
        const existingIndex = current.findIndex((page) => page.id === savedPage.id);
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = savedPage;
          return next;
        }
        return [savedPage, ...current];
      });
      openPageInEditor(savedPage);
      toast.success(isUpdating ? 'Page updated' : 'Page created');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to save page'));
    } finally {
      setSavingPage(false);
    }
  };

  const handleDeletePage = async (targetPage = editorPage) => {
    if (!targetPage?.id) {
      if (targetPage === editorPage) {
        handleDiscardChanges();
      }
      return;
    }

    if (!window.confirm(`Delete "${targetPage.title}"?`)) return;

    setDeletingPageId(targetPage.id);
    try {
      await pageAPI.deletePage(targetPage.id);
      const nextPages = pages.filter((page) => page.id !== targetPage.id);
      setPages(nextPages);

      if (editorPage?.id === targetPage.id) {
        if (nextPages.length > 0) {
          openPageInEditor(nextPages[0]);
        } else {
          createFreshPage();
        }
      }

      toast.success('Page deleted');
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to delete page'));
    } finally {
      setDeletingPageId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
            Page Builder
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage all storefront pages from one place. Open any saved page, duplicate it into a draft, or start a new page without losing the current editor state.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleStartNewPage} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            <FilePlus2 className="h-4 w-4" />
            New page
          </button>
          <button type="button" onClick={handleDuplicatePage} disabled={!editorPage} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            <CopyPlus className="h-4 w-4" />
            Duplicate
          </button>
          <button type="button" onClick={handleOpenPreview} disabled={!canPreviewPage} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button type="button" onClick={handleSavePage} disabled={savingPage || !editorPage} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" />
            {savingPage ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Pages</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{pageStats.total}</p>
          <p className="mt-2 text-sm text-slate-500">Every saved storefront page in the builder.</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Published</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{pageStats.published}</p>
          <p className="mt-2 text-sm text-slate-500">Live pages visitors can open right now.</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Drafts</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{pageStats.draft}</p>
          <p className="mt-2 text-sm text-slate-500">Pages waiting for review or publication.</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Homepage</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{pageStats.homepage}</p>
          <p className="mt-2 text-sm text-slate-500">The page currently marked as the storefront homepage.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr),360px]">
        <div className="self-start xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:pr-1">
          <PageBuilderSidebar
            pages={filteredPages}
            pageStats={pageStats}
            savedPageCount={pages.length}
            loadingPages={loadingPages}
            pageSearch={pageSearch}
            statusFilter={pageStatusFilter}
            pageSort={pageSort}
            onPageSearchChange={setPageSearch}
            onStatusFilterChange={setPageStatusFilter}
            onPageSortChange={setPageSort}
            editorPage={editorPage}
            draftPage={draftPage}
            hasPendingChanges={hasPendingChanges}
            onSelectPage={selectPage}
            onCreatePage={handleStartNewPage}
            onDiscardChanges={handleDiscardChanges}
            onDuplicatePage={handleDuplicatePage}
            onPreviewPage={handleOpenPreview}
            onDeletePage={handleDeletePage}
            onAddBlock={handleAddBlock}
            onStartBlockDrag={setDraggedSidebarBlockType}
            onEndBlockDrag={() => setDraggedSidebarBlockType(null)}
            selectedBlockId={selectedBlockId}
            onSelectBlock={selectBlock}
            onMoveBlock={handleMoveBlock}
            onRemoveBlock={handleRemoveBlock}
            showBlockList={false}
          />
        </div>

        <div>
          {editorPage ? (
            <PageBuilderCanvasEditor
              page={editorPage}
              pageValidation={pageValidation}
              hasPendingChanges={hasPendingChanges}
              selectedBlockId={selectedBlockId}
              linkedProducts={linkedProducts}
              sidebarDraggedBlockType={draggedSidebarBlockType}
              onSelectBlock={selectBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onRemoveBlock={handleRemoveBlock}
              onMoveBlock={handleMoveBlock}
              onAddBlock={handleAddBlock}
              onReorderBlock={moveBlockToIndex}
            />
          ) : null}
        </div>

        <div className="space-y-6 self-start xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:pr-1">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6">
            <div className="mb-5 flex flex-wrap gap-2">
              <InspectorTabButton active={inspectorTab === 'page'} label="Page Settings" onClick={() => setInspectorTab('page')} />
              <InspectorTabButton active={inspectorTab === 'block'} label="Block Settings" onClick={() => setInspectorTab('block')} />
            </div>

            {inspectorTab === 'page' && editorPage ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <PageStatusBadge status={editorPage.status} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {editorPage.updatedAt ? `Updated ${new Date(editorPage.updatedAt).toLocaleString()}` : 'Not saved yet'}
                  </span>
                </div>

                {pageValidation.messages.length > 0 ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                    {pageValidation.messages.join(' ')}
                  </div>
                ) : null}

                <div>
                  <label className={labelClassName}>Page Title</label>
                  <input className={inputClassName} placeholder="About us" value={editorPage.title} onChange={(event) => handleTitleChange(event.target.value)} />
                </div>
                <div>
                  <label className={labelClassName}>Slug</label>
                  <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/10">
                    <span className="border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">/</span>
                    <input className="w-full px-4 py-3 text-sm text-slate-700 outline-none" placeholder="about" value={editorPage.slug} onChange={(event) => updateEditorPage((current) => ({ ...current, slug: slugifyPagePath(event.target.value) }))} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Storefront URL: {pageValidation.normalizedSlug ? getPagePath(pageValidation.normalizedSlug) : 'Add a valid slug'}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Status</label>
                    <select className={inputClassName} value={editorPage.status} onChange={(event) => updateEditorPage((current) => ({ ...current, status: event.target.value }))}>
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Template</label>
                    <input className={inputClassName} value={editorPage.template} onChange={(event) => updateEditorPage((current) => ({ ...current, template: event.target.value }))} />
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    checked={editorPage.isHomepage}
                    onChange={(event) => updateEditorPage((current) => ({ ...current, isHomepage: event.target.checked }))}
                  />
                  Set this as the homepage
                </label>
                <div>
                  <label className={labelClassName}>SEO Title</label>
                  <input className={inputClassName} value={editorPage.seo.title} onChange={(event) => updateEditorPage((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))} />
                </div>
                <div>
                  <label className={labelClassName}>SEO Keywords</label>
                  <input className={inputClassName} value={editorPage.seo.keywords} onChange={(event) => updateEditorPage((current) => ({ ...current, seo: { ...current.seo, keywords: event.target.value } }))} />
                </div>
                <div>
                  <label className={labelClassName}>SEO Description</label>
                  <textarea className={`${inputClassName} min-h-28`} value={editorPage.seo.description} onChange={(event) => updateEditorPage((current) => ({ ...current, seo: { ...current.seo, description: event.target.value } }))} />
                </div>

                <div className="grid gap-3 pt-2">
                  <button type="button" onClick={handleDiscardChanges} disabled={!hasPendingChanges} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                    <RefreshCcw className="h-4 w-4" />
                    Discard Changes
                  </button>
                  <button type="button" onClick={handleDeletePage} disabled={Boolean(editorPage.id && deletingPageId === editorPage.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
                    <Trash2 className="h-4 w-4" />
                    {editorPage.id ? (deletingPageId === editorPage.id ? 'Deleting...' : 'Delete Page') : 'Discard Draft'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {activeBlock ? (
                  <>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          {(() => {
                            const Icon = BLOCK_ICONS[activeBlock.type];
                            return Icon ? <Icon className="h-4 w-4" /> : null;
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{getBlockLabel(activeBlock.type)}</p>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-950">{getBlockSummary(activeBlock)}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            Section {activeBlockIndex + 1} of {editorPage?.content.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleDuplicateBlock(activeBlock.id)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        <CopyPlus className="h-4 w-4" />
                        Duplicate
                      </button>
                      <button type="button" onClick={() => handleMoveBlock(activeBlock.id, -1)} disabled={activeBlockIndex <= 0} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Move up
                      </button>
                      <button type="button" onClick={() => handleMoveBlock(activeBlock.id, 1)} disabled={activeBlockIndex === editorPage.content.length - 1} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Move down
                      </button>
                      <button type="button" onClick={() => handleRemoveBlock(activeBlock.id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>

                    <PageBuilderBlockEditor
                      block={activeBlock}
                      linkedProducts={linkedProducts}
                      productResults={productResults}
                      loadingProductResults={loadingProductResults}
                      productSearch={productSearch}
                      onProductSearchChange={setProductSearch}
                      onUpdateData={(partialData) => activeBlock && updateBlockData(activeBlock.id, partialData)}
                      onToggleProduct={handleToggleProduct}
                      onMoveSelectedProduct={handleMoveSelectedProduct}
                      onAddFeatureItem={handleAddFeatureItem}
                      onRemoveFeatureItem={handleRemoveFeatureItem}
                    />
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Select a section in the preview to edit its fields.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">Section Outline</h2>
              <p className="mt-1 text-sm text-slate-500">
                Click a section to edit it, or drag the same sections directly in the center preview.
              </p>
            </div>

            <div className="space-y-3">
              {editorPage?.content?.length ? editorPage.content.map((block, index) => {
                const selected = block.id === selectedBlockId;

                return (
                  <div
                    key={block.id}
                    className={`rounded-3xl border p-4 transition ${
                      selected
                        ? 'border-cyan-300 bg-cyan-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectBlock(block.id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        {(() => {
                          const Icon = BLOCK_ICONS[block.type];
                          return Icon ? <Icon className="h-4 w-4" /> : null;
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">{getBlockLabel(block.type)}</p>
                          <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{getBlockSummary(block)}</p>
                      </div>
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleMoveBlock(block.id, -1)} disabled={index === 0} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Up
                      </button>
                      <button type="button" onClick={() => handleMoveBlock(block.id, 1)} disabled={index === editorPage.content.length - 1} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Down
                      </button>
                      <button type="button" onClick={() => handleDuplicateBlock(block.id)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        Duplicate
                      </button>
                      <button type="button" onClick={() => handleRemoveBlock(block.id)} className="rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Add blocks from the left panel to start building.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
