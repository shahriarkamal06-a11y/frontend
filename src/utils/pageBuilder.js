const slugifySegment = (value = '') => (
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const createId = (prefix = 'block') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const PAGE_BLOCK_LIBRARY = [
  { type: 'hero', label: 'Hero', description: 'Lead with a headline, supporting copy, and primary actions.' },
  { type: 'richText', label: 'Rich Text', description: 'Write flexible body content with headings and paragraphs.' },
  { type: 'image', label: 'Image', description: 'Drop in a single visual block with caption support.' },
  { type: 'featureList', label: 'Feature List', description: 'Highlight key benefits, services, or promises.' },
  { type: 'productGrid', label: 'Product Grid', description: 'Link products directly into the page builder.' },
  { type: 'cta', label: 'Call To Action', description: 'Close the page with a strong conversion section.' },
  { type: 'spacer', label: 'Spacer', description: 'Add breathing room between sections.' },
];

const BLOCK_DEFAULTS = {
  hero: {
    eyebrow: 'New page',
    heading: 'Tell visitors what this page is for',
    body: 'Use this hero to set context fast and steer people toward the next action.',
    imageUrl: '',
    align: 'left',
    primaryLabel: 'Explore',
    primaryHref: '/products',
    secondaryLabel: '',
    secondaryHref: '',
  },
  richText: {
    heading: 'Add a section heading',
    body: 'Write the supporting content for this page here.',
  },
  image: {
    imageUrl: '',
    altText: '',
    caption: '',
    aspect: 'wide',
  },
  featureList: {
    heading: 'Why this matters',
    body: 'Break the value into quick, readable points.',
    items: [
      { id: createId('feature'), title: 'Fast to scan', description: 'Use short statements that communicate the benefit immediately.' },
      { id: createId('feature'), title: 'Easy to update', description: 'Each feature item stays editable from the builder.' },
      { id: createId('feature'), title: 'Future-proof', description: 'This block can expand later with icons or richer content.' },
    ],
  },
  productGrid: {
    heading: 'Linked products',
    body: 'Select products from the catalog and place them directly on this page.',
    productIds: [],
    columns: 3,
  },
  cta: {
    heading: 'Ready for the next step?',
    body: 'Use this section for the strongest action on the page.',
    primaryLabel: 'Shop now',
    primaryHref: '/products',
    secondaryLabel: '',
    secondaryHref: '',
    tone: 'dark',
  },
  spacer: {
    size: 'md',
  },
};

const normalizeFeatureItems = (items = []) => (
  Array.isArray(items)
    ? items
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        id: item.id || createId('feature'),
        title: item.title || '',
        description: item.description || '',
      }))
    : []
);

export const slugifyPagePath = (value = '') => (
  String(value)
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((segment) => slugifySegment(segment))
    .filter(Boolean)
    .join('/')
);

export const getPagePath = (slug = '') => {
  const normalized = slugifyPagePath(slug);
  return normalized ? `/${normalized}` : '/';
};

export const createPageBuilderBlock = (type) => {
  const defaults = BLOCK_DEFAULTS[type];

  return {
    id: createId('block'),
    type,
    data: defaults ? JSON.parse(JSON.stringify(defaults)) : {},
  };
};

export const normalizePageBlock = (block = {}, index = 0) => {
  const type = BLOCK_DEFAULTS[block.type] ? block.type : 'richText';
  const base = createPageBuilderBlock(type);
  const mergedData = {
    ...base.data,
    ...(block.data && typeof block.data === 'object' && !Array.isArray(block.data) ? block.data : {}),
  };

  if (type === 'featureList') {
    mergedData.items = normalizeFeatureItems(mergedData.items);
  }

  if (type === 'productGrid') {
    mergedData.productIds = Array.isArray(mergedData.productIds)
      ? mergedData.productIds.filter(Boolean)
      : [];
  }

  return {
    id: block.id || `block-${index + 1}`,
    type,
    data: mergedData,
  };
};

export const normalizePageRecord = (page = {}) => ({
  id: page.id || page.pageId || null,
  title: page.title || '',
  slug: slugifyPagePath(page.slug || ''),
  status: page.status || 'DRAFT',
  isHomepage: page.isHomepage ?? page.is_homepage ?? false,
  seo: {
    title: page.seo?.title || '',
    description: page.seo?.description || '',
    keywords: page.seo?.keywords || '',
  },
  template: page.template || 'default',
  content: Array.isArray(page.content)
    ? page.content.map((block, index) => normalizePageBlock(block, index))
    : [],
  createdAt: page.createdAt || page.created_at || null,
  updatedAt: page.updatedAt || page.updated_at || null,
});

export const createEmptyPageRecord = () => ({
  id: null,
  title: '',
  slug: '',
  status: 'DRAFT',
  isHomepage: false,
  seo: {
    title: '',
    description: '',
    keywords: '',
  },
  template: 'default',
  content: [createPageBuilderBlock('hero'), createPageBuilderBlock('richText')],
  createdAt: null,
  updatedAt: null,
});

export const extractLinkedProductIds = (blocks = []) => {
  const ids = [];

  blocks.forEach((block) => {
    if (block?.type !== 'productGrid') {
      return;
    }

    const productIds = Array.isArray(block.data?.productIds) ? block.data.productIds : [];
    productIds.forEach((id) => {
      if (id && !ids.includes(id)) {
        ids.push(id);
      }
    });
  });

  return ids;
};

export const sortProductsByIds = (products = [], ids = []) => {
  const productMap = new Map(products.map((product) => [product.id, product]));
  return ids.map((id) => productMap.get(id)).filter(Boolean);
};
