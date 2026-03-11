export const HOMEPAGE_SECTION_TYPES = {
  PRODUCT_GRID: 'PRODUCT_GRID',
  PROMO: 'PROMO',
  MEDIA_GRID: 'MEDIA_GRID',
  TESTIMONIALS: 'TESTIMONIALS',
  MARQUEE: 'MARQUEE',
  CTA: 'CTA',
};

export const HOMEPAGE_SECTION_TYPE_OPTIONS = [
  { value: HOMEPAGE_SECTION_TYPES.PRODUCT_GRID, label: 'Product Grid', description: 'Homepage catalog section linked to product assignments.' },
  { value: HOMEPAGE_SECTION_TYPES.PROMO, label: 'Promo Banner', description: 'Editorial or promotional storytelling block with CTA buttons.' },
  { value: HOMEPAGE_SECTION_TYPES.MEDIA_GRID, label: 'Media Grid', description: 'Upload screenshots, UGC, or social proof images for a slider.' },
  { value: HOMEPAGE_SECTION_TYPES.TESTIMONIALS, label: 'Testimonials', description: 'Ratings and social-proof quotes.' },
  { value: HOMEPAGE_SECTION_TYPES.MARQUEE, label: 'Marquee', description: 'Scrolling list of collections, campaigns, or highlights.' },
  { value: HOMEPAGE_SECTION_TYPES.CTA, label: 'Call To Action', description: 'Closing conversion block with primary and secondary actions.' },
];

const createContentItemId = (prefix = 'item') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const BASE_CONTENT = {
  badge: '',
  buttonText: '',
  buttonLink: '',
  secondaryButtonText: '',
  secondaryButtonLink: '',
  imageUrl: '',
  tone: 'slate',
  items: [],
};

const DEFAULT_CONTENT_BY_TYPE = {
  [HOMEPAGE_SECTION_TYPES.PRODUCT_GRID]: {
    ...BASE_CONTENT,
    tone: 'slate',
  },
  [HOMEPAGE_SECTION_TYPES.PROMO]: {
    ...BASE_CONTENT,
    badge: 'Featured Story',
    buttonText: 'Start shopping',
    buttonLink: '/products',
    secondaryButtonText: 'Learn more',
    secondaryButtonLink: '/about',
    tone: 'violet',
  },
  [HOMEPAGE_SECTION_TYPES.MEDIA_GRID]: {
    ...BASE_CONTENT,
    badge: 'Social Proof',
    tone: 'rose',
    items: [],
  },
  [HOMEPAGE_SECTION_TYPES.TESTIMONIALS]: {
    ...BASE_CONTENT,
    badge: 'Testimonials',
    tone: 'rose',
    items: [],
  },
  [HOMEPAGE_SECTION_TYPES.MARQUEE]: {
    ...BASE_CONTENT,
    badge: 'Popular Collections',
    tone: 'slate',
    items: [],
  },
  [HOMEPAGE_SECTION_TYPES.CTA]: {
    ...BASE_CONTENT,
    badge: 'Ready To Shop',
    buttonText: 'Shop now',
    buttonLink: '/products',
    secondaryButtonText: 'Learn more',
    secondaryButtonLink: '/about',
    tone: 'violet',
  },
};

export const HOMEPAGE_SECTION_TONE_OPTIONS = [
  { value: 'violet', label: 'Violet' },
  { value: 'amber', label: 'Amber' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'rose', label: 'Rose' },
  { value: 'blue', label: 'Blue' },
  { value: 'slate', label: 'Slate' },
];

export const createHomepageSectionItem = (type) => {
  const normalizedType = normalizeHomepageSectionType(type);

  if (normalizedType === HOMEPAGE_SECTION_TYPES.TESTIMONIALS) {
    return {
      id: createContentItemId('testimonial'),
      quote: '',
      author: '',
      role: '',
      rating: 5,
      imageUrl: '',
    };
  }

  if (normalizedType === HOMEPAGE_SECTION_TYPES.MEDIA_GRID) {
    return {
      id: createContentItemId('media'),
      imageUrl: '',
    };
  }

  if (normalizedType === HOMEPAGE_SECTION_TYPES.MARQUEE) {
    return {
      id: createContentItemId('marquee'),
      label: '',
    };
  }

  return {
    id: createContentItemId('item'),
    title: '',
    body: '',
  };
};

const normalizeMediaItem = (item = {}, index = 0) => ({
  id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createContentItemId(`media-${index + 1}`),
  imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '',
});

const normalizeTestimonialItem = (item = {}, index = 0) => ({
  id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createContentItemId(`testimonial-${index + 1}`),
  quote: typeof item.quote === 'string' ? item.quote.trim() : '',
  author: typeof item.author === 'string' ? item.author.trim() : '',
  role: typeof item.role === 'string' ? item.role.trim() : '',
  rating: Number.isFinite(Number(item.rating)) ? Math.max(1, Math.min(5, Number(item.rating))) : 5,
  imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '',
});

const normalizeMarqueeItem = (item = {}, index = 0) => ({
  id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : createContentItemId(`marquee-${index + 1}`),
  label: typeof item.label === 'string' ? item.label.trim() : '',
});

export const normalizeHomepageSectionType = (value) => {
  const normalized = String(value || HOMEPAGE_SECTION_TYPES.PRODUCT_GRID).trim().toUpperCase();
  return Object.values(HOMEPAGE_SECTION_TYPES).includes(normalized)
    ? normalized
    : HOMEPAGE_SECTION_TYPES.PRODUCT_GRID;
};

export const createHomepageSectionContent = (type) => {
  const normalizedType = normalizeHomepageSectionType(type);
  return JSON.parse(JSON.stringify(DEFAULT_CONTENT_BY_TYPE[normalizedType] || DEFAULT_CONTENT_BY_TYPE[HOMEPAGE_SECTION_TYPES.PRODUCT_GRID]));
};

export const normalizeHomepageSectionContent = (type, rawContent = {}) => {
  const normalizedType = normalizeHomepageSectionType(type);
  const defaults = DEFAULT_CONTENT_BY_TYPE[normalizedType] || DEFAULT_CONTENT_BY_TYPE[HOMEPAGE_SECTION_TYPES.PRODUCT_GRID];
  const source = rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent) ? rawContent : {};
  let items = [];

  if (Array.isArray(source.items)) {
    if (normalizedType === HOMEPAGE_SECTION_TYPES.TESTIMONIALS) {
      items = source.items
        .map(normalizeTestimonialItem)
        .filter((item) => item.quote || item.author);
    } else if (normalizedType === HOMEPAGE_SECTION_TYPES.MEDIA_GRID) {
      items = source.items
        .map(normalizeMediaItem)
        .filter((item) => item.imageUrl);
    } else if (normalizedType === HOMEPAGE_SECTION_TYPES.MARQUEE) {
      items = source.items
        .map(normalizeMarqueeItem)
        .filter((item) => item.label);
    }
  }

  return {
    ...defaults,
    ...source,
    badge: typeof source.badge === 'string' ? source.badge.trim() : defaults.badge,
    buttonText: typeof source.buttonText === 'string' ? source.buttonText.trim() : defaults.buttonText,
    buttonLink: typeof source.buttonLink === 'string' ? source.buttonLink.trim() : defaults.buttonLink,
    secondaryButtonText: typeof source.secondaryButtonText === 'string' ? source.secondaryButtonText.trim() : defaults.secondaryButtonText,
    secondaryButtonLink: typeof source.secondaryButtonLink === 'string' ? source.secondaryButtonLink.trim() : defaults.secondaryButtonLink,
    imageUrl: typeof source.imageUrl === 'string' ? source.imageUrl.trim() : defaults.imageUrl,
    tone: typeof source.tone === 'string' && source.tone.trim() ? source.tone.trim().toLowerCase() : defaults.tone,
    items,
  };
};

export const normalizeHomepageSection = (section = {}) => {
  const type = normalizeHomepageSectionType(section.type);

  return {
    ...section,
    type,
    content: normalizeHomepageSectionContent(type, section.content),
    isActive: section.is_active !== undefined ? section.is_active : section.isActive !== false,
    sortOrder: section.sort_order ?? section.sortOrder ?? 0,
    createdAt: section.createdAt ?? section.created_at ?? null,
    updatedAt: section.updatedAt ?? section.updated_at ?? null,
  };
};

export const getHomepageSectionTypeLabel = (type) => (
  HOMEPAGE_SECTION_TYPE_OPTIONS.find((option) => option.value === normalizeHomepageSectionType(type))?.label
  || 'Section'
);
