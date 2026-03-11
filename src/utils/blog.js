const slugifyBlogSegment = (value = '') => (
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

export const BLOG_STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export const slugifyBlogPost = (value = '') => slugifyBlogSegment(value);

export const normalizeBlogPost = (post = {}) => ({
  id: post.id || null,
  title: post.title || '',
  slug: slugifyBlogPost(post.slug || ''),
  excerpt: post.excerpt || '',
  content: post.content || '',
  coverImage: post.coverImage || post.cover_image || '',
  category: post.category || '',
  featured: post.featured === true,
  linkedProductIds: Array.isArray(post.linkedProductIds || post.linked_product_ids)
    ? (post.linkedProductIds || post.linked_product_ids).filter(Boolean)
    : [],
  tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
  status: post.status || 'DRAFT',
  seo: {
    title: post.seo?.title || '',
    description: post.seo?.description || '',
    keywords: post.seo?.keywords || '',
  },
  authorName: post.authorName || post.author_name || '',
  authorAvatar: post.authorAvatar || post.author_avatar || '',
  publishedAt: post.publishedAt || post.published_at || null,
  createdAt: post.createdAt || post.created_at || null,
  updatedAt: post.updatedAt || post.updated_at || null,
  viewCount: Number(post.viewCount || post.view_count) || 0,
});

export const createEmptyBlogPost = () => ({
  id: null,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  featured: false,
  linkedProductIds: [],
  tags: [],
  status: 'DRAFT',
  seo: {
    title: '',
    description: '',
    keywords: '',
  },
  authorName: '',
  authorAvatar: '',
  publishedAt: null,
  createdAt: null,
  updatedAt: null,
  viewCount: 0,
});

export const stripRichText = (value = '') => (
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const buildBlogExcerpt = (post, maxLength = 180) => {
  const explicitExcerpt = stripRichText(post?.excerpt || '');
  if (explicitExcerpt) {
    return explicitExcerpt.length > maxLength
      ? `${explicitExcerpt.slice(0, maxLength).trimEnd()}...`
      : explicitExcerpt;
  }

  const contentText = stripRichText(post?.content || '');
  if (!contentText) {
    return 'No excerpt available.';
  }

  return contentText.length > maxLength
    ? `${contentText.slice(0, maxLength).trimEnd()}...`
    : contentText;
};

export const getReadingTimeLabel = (content = '') => {
  const words = stripRichText(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

export const formatBlogDate = (value) => {
  if (!value) return 'Draft';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Draft';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
