import { useState } from 'react';
import { CopyPlus, GripVertical, Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react';
import PageBuilderRenderer from '../PageBuilderRenderer';
import { PAGE_BLOCK_LIBRARY, getPagePath } from '../../../utils/pageBuilder';
import {
  BLOCK_ICONS,
  PAGE_BUILDER_DRAG_BLOCK_ID,
  PAGE_BUILDER_DRAG_BLOCK_TYPE,
  getBlockSummary,
  PageStatusBadge,
} from './pageBuilderAdmin';

const getBlockLabel = (type) => PAGE_BLOCK_LIBRARY.find((entry) => entry.type === type)?.label || type;

const PreviewModeButton = ({ active, label, icon, onClick }) => {
  const Icon = icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-slate-950 text-white'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </button>
  );
};

const CanvasInsertSlot = ({
  slotIndex,
  active,
  open,
  isDragging,
  dragLabel,
  onToggle,
  onDragOver,
  onDrop,
  onAddBlock,
  onClose,
}) => (
  <div
    onDragOver={(event) => onDragOver(slotIndex, event)}
    onDrop={(event) => onDrop(slotIndex, event)}
    className={`relative my-3 rounded-3xl border border-dashed px-4 py-3 transition ${
      active
        ? 'border-cyan-400 bg-cyan-50'
        : open
          ? 'border-slate-300 bg-white'
          : 'border-transparent bg-transparent hover:border-slate-300 hover:bg-white/80'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`h-px flex-1 ${active ? 'bg-cyan-400' : 'bg-slate-200'}`} />
      <button
        type="button"
        onClick={() => onToggle(slotIndex)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          open
            ? 'bg-slate-950 text-white'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {isDragging ? dragLabel : 'Add section here'}
      </button>
      <div className={`h-px flex-1 ${active ? 'bg-cyan-400' : 'bg-slate-200'}`} />
    </div>

    {open ? (
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {PAGE_BLOCK_LIBRARY.map((entry) => {
          const Icon = BLOCK_ICONS[entry.type];

          return (
            <button
              key={`${slotIndex}-${entry.type}`}
              type="button"
              onClick={() => {
                onAddBlock(entry.type, slotIndex);
                onClose();
              }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
                {Icon ? <Icon className="h-4 w-4" /> : null}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{entry.label}</p>
                <p className="truncate text-xs text-slate-500">{entry.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    ) : null}
  </div>
);

const PageBuilderCanvasEditor = ({
  page,
  pageValidation,
  hasPendingChanges,
  selectedBlockId,
  linkedProducts,
  sidebarDraggedBlockType,
  onSelectBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onMoveBlock,
  onAddBlock,
  onReorderBlock,
}) => {
  const [previewViewport, setPreviewViewport] = useState('desktop');
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);
  const [insertMenuIndex, setInsertMenuIndex] = useState(null);
  const isDragging = Boolean(draggedBlockId || sidebarDraggedBlockType);
  const dragLabel = sidebarDraggedBlockType
    ? `Drop ${getBlockLabel(sidebarDraggedBlockType)} here`
    : 'Drop section here';

  const previewWidthClass = previewViewport === 'mobile'
    ? 'max-w-[420px]'
    : previewViewport === 'tablet'
      ? 'max-w-[860px]'
      : 'max-w-[1180px]';

  const handleCanvasDragStart = (blockId, event) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(PAGE_BUILDER_DRAG_BLOCK_ID, blockId);
      event.dataTransfer.setData('text/plain', `move-block:${blockId}`);
    }

    setDraggedBlockId(blockId);
    setInsertMenuIndex(null);
    onSelectBlock(blockId);
  };

  const handleCanvasDragOver = (slotIndex, event) => {
    event.preventDefault();
    const draggedType = event.dataTransfer?.getData(PAGE_BUILDER_DRAG_BLOCK_TYPE);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = draggedType ? 'copy' : 'move';
    }

    if (dragOverSlotIndex !== slotIndex) {
      setDragOverSlotIndex(slotIndex);
    }
  };

  const handleCanvasDrop = (slotIndex, event) => {
    event.preventDefault();
    const droppedBlockType = event.dataTransfer?.getData(PAGE_BUILDER_DRAG_BLOCK_TYPE);
    const droppedBlockId = draggedBlockId || event.dataTransfer?.getData(PAGE_BUILDER_DRAG_BLOCK_ID);

    if (droppedBlockType) {
      const nextBlockId = onAddBlock(droppedBlockType, slotIndex);
      if (nextBlockId) {
        onSelectBlock(nextBlockId);
      }
    } else if (droppedBlockId) {
      onReorderBlock(droppedBlockId, slotIndex);
      onSelectBlock(droppedBlockId);
    }

    setDraggedBlockId(null);
    setDragOverSlotIndex(null);
  };

  const handleCanvasDragEnd = () => {
    setDraggedBlockId(null);
    setDragOverSlotIndex(null);
  };

  return (
    <section className="rounded-[36px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] lg:p-6">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-950">{page.title || 'Untitled page'}</h2>
              <PageStatusBadge status={page.status} />
              {page.id ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Saved page
                </span>
              ) : (
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  Local draft
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {pageValidation.normalizedSlug ? getPagePath(pageValidation.normalizedSlug) : 'Add a title and slug to define the page URL'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <PreviewModeButton active={previewViewport === 'desktop'} label="Desktop" icon={Monitor} onClick={() => setPreviewViewport('desktop')} />
            <PreviewModeButton active={previewViewport === 'tablet'} label="Tablet" icon={Tablet} onClick={() => setPreviewViewport('tablet')} />
            <PreviewModeButton active={previewViewport === 'mobile'} label="Mobile" icon={Smartphone} onClick={() => setPreviewViewport('mobile')} />
          </div>
        </div>

        {hasPendingChanges ? (
          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm text-cyan-900">
            The center preview is live. Click any section to edit it, drag sections to reorder them, or drag new blocks from the left panel into any insert line.
          </div>
        ) : null}
      </div>

      <div className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_40%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] p-3 lg:p-5">
        <div className={`mx-auto transition-all duration-300 ${previewWidthClass}`}>
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="max-w-[70%] truncate rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500">
                {pageValidation.normalizedSlug ? getPagePath(pageValidation.normalizedSlug) : '/preview'}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Live Canvas</div>
            </div>

            <div className="max-h-[76vh] overflow-auto bg-slate-100 p-3 lg:p-4">
              <div className="rounded-[24px] border border-slate-200 bg-white">
                {!page?.content?.length ? (
                  <CanvasInsertSlot
                    slotIndex={0}
                    active={dragOverSlotIndex === 0}
                    open={insertMenuIndex === 0}
                    isDragging={isDragging}
                    dragLabel={dragLabel}
                    onToggle={(slot) => setInsertMenuIndex((current) => current === slot ? null : slot)}
                    onDragOver={handleCanvasDragOver}
                    onDrop={handleCanvasDrop}
                    onAddBlock={onAddBlock}
                    onClose={() => setInsertMenuIndex(null)}
                  />
                ) : null}

                <PageBuilderRenderer
                  page={page}
                  linkedProducts={linkedProducts}
                  renderBlockWrapper={({ block, index, isLast, totalBlocks, children }) => (
                    <div key={block.id} className="group relative">
                      <CanvasInsertSlot
                        slotIndex={index}
                        active={dragOverSlotIndex === index}
                        open={insertMenuIndex === index}
                        isDragging={isDragging}
                        dragLabel={dragLabel}
                        onToggle={(slot) => setInsertMenuIndex((current) => current === slot ? null : slot)}
                        onDragOver={handleCanvasDragOver}
                        onDrop={handleCanvasDrop}
                        onAddBlock={onAddBlock}
                        onClose={() => setInsertMenuIndex(null)}
                      />

                      <div
                        draggable
                        onDragStart={(event) => handleCanvasDragStart(block.id, event)}
                        onDragEnd={handleCanvasDragEnd}
                        onClick={() => onSelectBlock(block.id)}
                        className={`relative cursor-pointer overflow-hidden rounded-[28px] transition ${
                          selectedBlockId === block.id
                            ? 'ring-2 ring-cyan-500 ring-offset-4 ring-offset-slate-100'
                            : 'hover:ring-1 hover:ring-slate-300 hover:ring-offset-4 hover:ring-offset-slate-100'
                        }`}
                      >
                        <div className={`pointer-events-auto absolute left-4 right-4 top-4 z-20 flex flex-wrap items-start justify-between gap-3 transition ${
                          selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-950/92 px-3 py-2 text-white shadow-lg">
                            <div className="rounded-xl bg-white/10 p-2 text-white">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                                {getBlockLabel(block.type)}
                              </p>
                              <p className="truncate text-sm font-semibold text-white">
                                {getBlockSummary(block)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDuplicateBlock(block.id);
                              }}
                              className="inline-flex items-center gap-1 rounded-2xl border border-white/20 bg-slate-950/92 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              <CopyPlus className="h-3.5 w-3.5" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMoveBlock(block.id, -1);
                              }}
                              disabled={index === 0}
                              className="rounded-2xl border border-white/20 bg-slate-950/92 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMoveBlock(block.id, 1);
                              }}
                              disabled={index === totalBlocks - 1}
                              className="rounded-2xl border border-white/20 bg-slate-950/92 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onRemoveBlock(block.id);
                              }}
                              className="inline-flex items-center gap-1 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="[&_a]:pointer-events-none [&_button]:pointer-events-none">
                          {children}
                        </div>
                      </div>

                      {isLast ? (
                        <CanvasInsertSlot
                          slotIndex={totalBlocks}
                          active={dragOverSlotIndex === totalBlocks}
                          open={insertMenuIndex === totalBlocks}
                          isDragging={isDragging}
                          dragLabel={dragLabel}
                          onToggle={(slot) => setInsertMenuIndex((current) => current === slot ? null : slot)}
                          onDragOver={handleCanvasDragOver}
                          onDrop={handleCanvasDrop}
                          onAddBlock={onAddBlock}
                          onClose={() => setInsertMenuIndex(null)}
                        />
                      ) : null}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageBuilderCanvasEditor;
