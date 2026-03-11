import { ArrowDown, ArrowUp, CopyPlus, Eye, FileText, Home, Plus, Search, Trash2 } from 'lucide-react';
import { PAGE_BLOCK_LIBRARY } from '../../../utils/pageBuilder';
import {
  BLOCK_ICONS,
  PAGE_BUILDER_DRAG_BLOCK_TYPE,
  STATUS_OPTIONS,
  getBlockSummary,
  PageStatusBadge,
  inputClassName,
} from './pageBuilderAdmin';

const PAGE_STATUS_FILTERS = ['ALL', ...STATUS_OPTIONS];

const formatUpdatedAt = (value) => {
  if (!value) {
    return 'Draft';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Draft';
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const BlockTypeButton = ({ type, label, description, onClick, onDragStart, onDragEnd }) => {
  const Icon = BLOCK_ICONS[type] || FileText;

  return (
    <button
      type="button"
      draggable
      onClick={onClick}
      onDragStart={(event) => {
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'copy';
          event.dataTransfer.setData(PAGE_BUILDER_DRAG_BLOCK_TYPE, type);
          event.dataTransfer.setData('text/plain', `new-block:${type}`);
        }

        onDragStart?.(type);
      }}
      onDragEnd={() => onDragEnd?.()}
      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-300 hover:bg-violet-50/60"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
};

const PageBuilderSidebar = ({
  pages,
  pageStats,
  savedPageCount,
  loadingPages,
  pageSearch,
  statusFilter,
  pageSort,
  onPageSearchChange,
  onStatusFilterChange,
  onPageSortChange,
  editorPage,
  draftPage,
  hasPendingChanges,
  onSelectPage,
  onCreatePage,
  onDiscardChanges,
  onDuplicatePage,
  onPreviewPage,
  onDeletePage,
  onAddBlock,
  onStartBlockDrag,
  onEndBlockDrag,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onRemoveBlock,
  showBlockList = true,
}) => (
  <aside className="space-y-6">
    <section className="rounded-[32px] border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Pages</h2>
          <p className="text-xs text-slate-500">
            {savedPageCount} saved pages, {pageStats.published} published, {pageStats.homepage} homepage
          </p>
        </div>
        <button
          type="button"
          onClick={onCreatePage}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />
          New page
        </button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputClassName} pl-10`}
          placeholder="Search pages"
          value={pageSearch}
          onChange={(event) => onPageSearchChange(event.target.value)}
        />
      </div>

      <div className="mb-4 grid gap-3">
        <div className="flex flex-wrap gap-2">
          {PAGE_STATUS_FILTERS.map((option) => {
            const selected = statusFilter === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onStatusFilterChange(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                {option === 'ALL' ? `All (${pageStats.total})` : `${option} (${pageStats[option.toLowerCase()] || 0})`}
              </button>
            );
          })}
        </div>

        <div>
          <select
            className={inputClassName}
            value={pageSort}
            onChange={(event) => onPageSortChange(event.target.value)}
          >
            <option value="updated-desc">Recently updated</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="slug-asc">Slug A-Z</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {draftPage ? (
          <div className="rounded-3xl border border-violet-300 bg-violet-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Working Draft</p>
                <p className="mt-2 truncate text-sm font-semibold text-slate-950">{draftPage.title || 'Untitled page'}</p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {draftPage.slug ? `/${draftPage.slug}` : 'Choose a title and slug before saving'}
                </p>
              </div>
              <PageStatusBadge status={draftPage.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{draftPage.content.length} blocks</span>
              <span>{draftPage.id ? 'Unsaved edits' : 'Not saved yet'}</span>
            </div>
            {hasPendingChanges ? (
              <button
                type="button"
                onClick={onDiscardChanges}
                className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Discard changes
              </button>
            ) : null}
          </div>
        ) : null}

        {loadingPages ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Loading pages...</p>
        ) : pages.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {savedPageCount === 0 ? 'No saved pages yet. Start a new page from the editor.' : 'No pages match this search.'}
          </p>
        ) : pages.map((page) => {
          const selected = editorPage?.id
            ? editorPage.id === page.id
            : editorPage?.slug === page.slug;

          return (
            <div
              key={page.id || page.slug}
              className={`w-full rounded-3xl border p-4 text-left transition ${
                selected
                  ? 'border-violet-300 bg-violet-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectPage(page)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{page.title || 'Untitled page'}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">/{page.slug}</p>
                  </div>
                  <PageStatusBadge status={page.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {page.isHomepage ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                      <Home className="h-3.5 w-3.5" />
                      Homepage
                    </span>
                  ) : null}
                  {selected ? (
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700">
                      Editing now
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{page.content.length} blocks</span>
                  <span>{formatUpdatedAt(page.updatedAt)}</span>
                </div>
              </button>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => onSelectPage(page)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {selected ? 'Continue editing' : 'Edit page'}
                </button>
                <button
                  type="button"
                  onClick={() => onPreviewPage(page)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicatePage(page)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <CopyPlus className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePage(page)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section className="rounded-[32px] border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Add Blocks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add new sections from here, or use the insert lines inside the center canvas to place them exactly where you need them.
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          Tip: drag any block into the live preview
        </p>
      </div>
      <div className="grid gap-3">
        {PAGE_BLOCK_LIBRARY.map((entry) => (
          <BlockTypeButton
            key={entry.type}
            {...entry}
            onClick={() => onAddBlock(entry.type)}
            onDragStart={onStartBlockDrag}
            onDragEnd={onEndBlockDrag}
          />
        ))}
      </div>
    </section>

    {showBlockList ? (
      <section className="rounded-[32px] border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Page Blocks</h2>
        <p className="mt-1 text-sm text-slate-500">Reorder sections and jump into block-level editing.</p>
      </div>
      <div className="space-y-3">
        {editorPage?.content?.length ? editorPage.content.map((block, index) => {
          const Icon = BLOCK_ICONS[block.type] || FileText;
          const selected = selectedBlockId === block.id;

          return (
            <div
              key={block.id}
              className={`rounded-3xl border p-4 transition ${
                selected
                  ? 'border-violet-300 bg-violet-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectBlock(block.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950">
                    {PAGE_BLOCK_LIBRARY.find((entry) => entry.type === block.type)?.label || block.type}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">{getBlockSummary(block)}</p>
                </div>
              </button>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onMoveBlock(block.id, -1)}
                  disabled={index === 0}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveBlock(block.id, 1)}
                  disabled={index === editorPage.content.length - 1}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveBlock(block.id)}
                  className="rounded-2xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        }) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Add a block to start building this page.
          </p>
        )}
      </div>
      </section>
    ) : null}
  </aside>
);

export default PageBuilderSidebar;
