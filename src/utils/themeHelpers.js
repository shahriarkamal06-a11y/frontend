export const THEME_FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Outfit', sans-serif", label: 'Outfit' },
];

export const BUTTON_STYLE_OPTIONS = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
];

export const HEADER_STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'centered', label: 'Centered' },
  { value: 'floating', label: 'Floating' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'storefront', label: 'Storefront' },
  { value: 'split', label: 'Split' },
  { value: 'bold', label: 'Bold' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'glass', label: 'Glass' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'boxed', label: 'Boxed' },
  { value: 'mono', label: 'Monochrome' },
  { value: 'luxe', label: 'Luxe' },
  { value: 'compact', label: 'Compact' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'underline', label: 'Underline' },
];

export const FOOTER_LAYOUT_OPTIONS = [
  { value: 'detailed', label: 'Detailed' },
  { value: 'simple', label: 'Simple' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'columns', label: 'Columns' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'grid', label: 'Grid' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'compact', label: 'Compact' },
  { value: 'card', label: 'Card' },
  { value: 'split', label: 'Split' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'centered', label: 'Centered' },
  { value: 'minimal-dark', label: 'Minimal Dark' },
  { value: 'boxed', label: 'Boxed' },
  { value: 'pill', label: 'Pill' },
  { value: 'luxe', label: 'Luxe' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'split-dark', label: 'Split Dark' },
];

export const PRODUCT_LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'masonry', label: 'Masonry' },
];

export const PRODUCT_CARD_VARIANT_OPTIONS = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'spotlight', label: 'Spotlight' },
  { value: 'compact', label: 'Compact' },
  { value: 'soft', label: 'Soft' },
  { value: 'glass', label: 'Glass' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'outline', label: 'Outline' },
  { value: 'split', label: 'Split' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'luxe', label: 'Luxe' },
  { value: 'minimal-card', label: 'Minimal Card' },
  { value: 'banner', label: 'Banner' },
];

export const PRODUCT_CARD_SIZE_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

const DISPLAY_FONT_MAP = {
  'Inter, sans-serif': "'Space Grotesk', 'Inter', system-ui, sans-serif",
  "'Poppins', sans-serif": "'Poppins', 'Inter', system-ui, sans-serif",
  "'Roboto', sans-serif": "'Roboto', 'Inter', system-ui, sans-serif",
  "'Outfit', sans-serif": "'Outfit', 'Inter', system-ui, sans-serif",
  'Georgia, serif': "Georgia, 'Times New Roman', serif",
  'Helvetica, sans-serif': "Helvetica, Arial, sans-serif",
};

export function getThemeDisplayFont(fontFamily = 'Inter, sans-serif') {
  return DISPLAY_FONT_MAP[fontFamily] || fontFamily;
}

export function getButtonRadiusClass(buttonStyle = 'rounded') {
  switch (buttonStyle) {
    case 'square':
      return 'rounded-md';
    case 'pill':
      return 'rounded-full';
    default:
      return 'rounded-xl';
  }
}

export function getSurfaceRadiusClass(buttonStyle = 'rounded') {
  switch (buttonStyle) {
    case 'square':
      return 'rounded-2xl';
    case 'pill':
      return 'rounded-[2rem]';
    default:
      return 'rounded-3xl';
  }
}

export function resolveProductLayout(layoutType = 'grid') {
  return PRODUCT_LAYOUT_OPTIONS.some((option) => option.value === layoutType)
    ? layoutType
    : 'grid';
}

export function resolveHeaderStyle(headerStyle = 'modern') {
  return HEADER_STYLE_OPTIONS.some((option) => option.value === headerStyle)
    ? headerStyle
    : 'modern';
}

export function resolveFooterLayout(footerLayout = 'detailed') {
  return FOOTER_LAYOUT_OPTIONS.some((option) => option.value === footerLayout)
    ? footerLayout
    : 'detailed';
}

export function resolveProductCardVariant(productCardVariant = 'editorial') {
  return PRODUCT_CARD_VARIANT_OPTIONS.some((option) => option.value === productCardVariant)
    ? productCardVariant
    : 'editorial';
}

export function resolveProductCardSize(productCardSize = 'comfortable') {
  return PRODUCT_CARD_SIZE_OPTIONS.some((option) => option.value === productCardSize)
    ? productCardSize
    : 'comfortable';
}

const GRID_COLUMN_CLASS_MAP = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
};

const PRODUCT_GRID_GAP_CLASS_MAP = {
  compact: 'gap-3 md:gap-4',
  comfortable: 'gap-4 lg:gap-6',
  spacious: 'gap-5 lg:gap-7',
};

const clampNumber = (value, min, max, fallback) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numericValue));
};

export function getNormalizedProductGridConfig(theme = {}) {
  return {
    rows: clampNumber(theme?.productGridRows, 1, 6, 4),
    mobileColumns: clampNumber(theme?.productGridColumnsMobile, 1, 2, 2),
    tabletColumns: clampNumber(theme?.productGridColumnsTablet, 1, 6, 3),
    desktopColumns: clampNumber(theme?.productGridColumnsDesktop, 1, 10, 3),
    cardSize: resolveProductCardSize(theme?.productCardSize),
  };
}

const getGridColumnClass = (prefix, columns, fallback) => {
  const className = GRID_COLUMN_CLASS_MAP[columns] || GRID_COLUMN_CLASS_MAP[fallback];
  if (!prefix) {
    return className;
  }

  return `${prefix}:${className}`;
};

export function getProductGridClassName(theme = {}) {
  const productGrid = getNormalizedProductGridConfig(theme);

  return [
    getGridColumnClass('', productGrid.mobileColumns, 2),
    getGridColumnClass('md', productGrid.tabletColumns, 3),
    getGridColumnClass('lg', productGrid.desktopColumns, 3),
    PRODUCT_GRID_GAP_CLASS_MAP[productGrid.cardSize] || PRODUCT_GRID_GAP_CLASS_MAP.comfortable,
  ].join(' ');
}

export function getProductGridPageSize(theme = {}, layoutType = 'grid') {
  const resolvedLayout = resolveProductLayout(layoutType || theme?.layoutType);
  const gridConfig = getNormalizedProductGridConfig(theme);

  if (resolvedLayout === 'list') {
    return Math.max(6, gridConfig.rows * 2);
  }

  return gridConfig.rows * gridConfig.desktopColumns;
}
