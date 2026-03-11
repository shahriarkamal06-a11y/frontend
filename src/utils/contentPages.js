const slugifySegment = (value = '') => (
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

export const CONTENT_PAGE_STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export const CONTENT_PAGE_GUIDE_ITEMS = [
  {
    title: 'How to structure HTML',
    description: 'Use semantic sections like section, article, header, main, and footer inside the page body. Inline CSS is supported, so spacing, colors, and layout can live directly in your markup.',
  },
  {
    title: 'How the layout works',
    description: 'The storefront header and footer stay fixed from the main site layout. This editor controls only the content that appears between them.',
  },
  {
    title: 'What users can modify',
    description: 'Update the page title, slug, SEO meta fields, and the full HTML or markdown body. If you change a slug such as about or contact, update any navigation links that point to that page.',
  },
];

export const CONTENT_PAGE_PROMPT_TEMPLATE = `Create a modern responsive HTML page section for an e-commerce website.
Use clean HTML structure, semantic tags, and do not use class name, use inline css.
I already have navbar and footer, so generate only the main page body.
Also give me a meta title and meta description for SEO.

Requirements:
[user requirements here]`;

export const slugifyContentPage = (value = '') => (
  String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((segment) => slugifySegment(segment))
    .filter(Boolean)
    .join('/')
);

export const getContentPagePath = (slug = '') => {
  const normalizedSlug = slugifyContentPage(slug);
  return normalizedSlug ? `/${normalizedSlug}` : '/';
};

export const normalizeContentPage = (page = {}) => ({
  id: page.id || null,
  title: page.title || '',
  slug: slugifyContentPage(page.slug || ''),
  metaTitle: page.metaTitle || page.meta_title || '',
  metaDescription: page.metaDescription || page.meta_description || '',
  content: page.content || '',
  status: page.status || 'DRAFT',
  publishedAt: page.publishedAt || page.published_at || null,
  createdAt: page.createdAt || page.created_at || null,
  updatedAt: page.updatedAt || page.updated_at || null,
});

export const createEmptyContentPage = (overrides = {}) => ({
  id: null,
  title: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  content: '',
  status: 'DRAFT',
  publishedAt: null,
  createdAt: null,
  updatedAt: null,
  ...overrides,
});

export const stripContentPageText = (value = '') => (
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const buildContentPageSummary = (page, maxLength = 140) => {
  const sourceText = stripContentPageText(page?.metaDescription || page?.content || '');
  if (!sourceText) {
    return 'No summary yet.';
  }

  return sourceText.length > maxLength
    ? `${sourceText.slice(0, maxLength).trimEnd()}...`
    : sourceText;
};

export const formatContentPageDate = (value) => {
  if (!value) return 'Not saved yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not saved yet';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
