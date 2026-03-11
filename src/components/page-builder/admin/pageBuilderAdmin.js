import {
  FileText,
  Image as ImageIcon,
  Layers,
  Megaphone,
  Package,
  SeparatorHorizontal,
  Sparkles,
} from 'lucide-react';

export const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
export const PAGE_BUILDER_DRAG_BLOCK_ID = 'application/x-page-builder-block-id';
export const PAGE_BUILDER_DRAG_BLOCK_TYPE = 'application/x-page-builder-block-type';

export const BLOCK_ICONS = {
  hero: Sparkles,
  richText: FileText,
  image: ImageIcon,
  featureList: Layers,
  productGrid: Package,
  cta: Megaphone,
  spacer: SeparatorHorizontal,
};

export const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10';
export const labelClassName = 'mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500';

export const getBlockSummary = (block) => {
  switch (block.type) {
    case 'hero':
      return block.data?.heading || 'Hero block';
    case 'richText':
      return block.data?.heading || 'Text section';
    case 'image':
      return block.data?.caption || block.data?.imageUrl || 'Image block';
    case 'featureList':
      return `${block.data?.items?.length || 0} feature items`;
    case 'productGrid':
      return `${block.data?.productIds?.length || 0} linked products`;
    case 'cta':
      return block.data?.heading || 'Call to action';
    case 'spacer':
      return `Spacing: ${block.data?.size || 'md'}`;
    default:
      return block.type;
  }
};

export const PageStatusBadge = ({ status }) => {
  const normalizedStatus = String(status || 'DRAFT').toUpperCase();
  const className = normalizedStatus === 'PUBLISHED'
    ? 'bg-emerald-100 text-emerald-700'
    : normalizedStatus === 'ARCHIVED'
      ? 'bg-slate-200 text-slate-600'
      : 'bg-amber-100 text-amber-700';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {normalizedStatus}
    </span>
  );
};
