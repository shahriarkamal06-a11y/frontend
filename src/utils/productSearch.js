const SYNONYMS = {
  tv: ['television'],
  phone: ['smartphone', 'cell', 'mobile'],
  laptop: ['notebook'],
  shoes: ['sneakers', 'trainers'],
  jacket: ['coat'],
  bag: ['handbag', 'backpack'],
  watch: ['smartwatch'],
  headphones: ['headset', 'earphones'],
  earbuds: ['earphones'],
};

const normalizeText = (value = '') => (
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
);

const compactText = (value = '') => normalizeText(value).replace(/\s+/g, '');

const tokenize = (query = '') => normalizeText(query).split(' ').filter(Boolean);

const expandTokens = (tokens = []) => {
  const expanded = new Set(tokens);
  tokens.forEach((token) => {
    const synonyms = SYNONYMS[token];
    if (Array.isArray(synonyms)) {
      synonyms.forEach((synonym) => expanded.add(synonym));
    }
  });
  return Array.from(expanded);
};

const scoreField = (fieldValue, token, weight) => {
  if (!fieldValue || !token) return 0;
  const field = normalizeText(fieldValue);
  if (!field) return 0;

  const tokenValue = token.toLowerCase();
  let score = 0;

  if (field === tokenValue) score += weight * 1.2;
  if (field.startsWith(tokenValue)) score += weight * 0.9;
  if (field.includes(tokenValue)) score += weight;

  const compactField = compactText(fieldValue);
  if (compactField && compactField.includes(tokenValue.replace(/\s+/g, ''))) {
    score += weight * 0.4;
  }

  return score;
};

const extractProductFields = (product = {}) => ({
  name: product.name || '',
  brand: product.brand || '',
  category: product.category || product.categoryName || product.categorySlug || '',
  description: product.description || product.shortDescription || '',
  tags: Array.isArray(product.tags) ? product.tags.join(' ') : '',
  sku: product.sku || '',
});

export const getProductFilterOptions = (products = []) => {
  const categories = [...new Set(products.map((p) => p.category || p.categoryName || p.categorySlug).filter(Boolean))];
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  const tags = [...new Set(products.flatMap((p) => p.tags || []))].sort();
  const maxPrice = Math.max(...products.map((p) => Number(p.price) || 0), 0);

  return {
    categories,
    brands,
    tags,
    maxPrice,
  };
};

export const filterAndScoreProducts = (products = [], query = '', filters = {}, options = {}) => {
  const tokens = expandTokens(tokenize(query));
  const matchAllTokens = Boolean(options.matchAllTokens);
  const hasQuery = tokens.length > 0;

  return products
    .filter((product) => {
      if (filters.section) {
        const sectionValue = String(filters.section);
        if (String(product.section) !== sectionValue && String(product.sectionSlug) !== sectionValue) {
          return false;
        }
      }

      if (Array.isArray(filters.categories) && filters.categories.length > 0) {
        const categoryValue = product.category || product.categoryName || product.categorySlug;
        if (!filters.categories.includes(categoryValue)) return false;
      }

      if (Array.isArray(filters.brands) && filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) return false;
      }

      if (Array.isArray(filters.tags) && filters.tags.length > 0) {
        const productTags = product.tags || [];
        if (!filters.tags.some((tag) => productTags.includes(tag))) return false;
      }

      if (filters.rating > 0 && Number(product.rating || 0) < filters.rating) {
        return false;
      }

      const minPrice = Number(filters.priceRange?.min ?? filters.priceRange?.[0] ?? 0);
      const maxPrice = Number(filters.priceRange?.max ?? filters.priceRange?.[1] ?? Number.MAX_SAFE_INTEGER);
      if (Number(product.price || 0) < minPrice || Number(product.price || 0) > maxPrice) {
        return false;
      }

      if (filters.inStock && Number(product.stock || 0) <= 0) {
        return false;
      }

      if (filters.onSale && !(product.comparePrice && product.comparePrice > product.price)) {
        return false;
      }

      return true;
    })
    .map((product) => {
      if (!hasQuery) {
        return { ...product, _score: 0 };
      }

      const fields = extractProductFields(product);
      let totalScore = 0;
      let matchedTokens = 0;

      tokens.forEach((token) => {
        const tokenScore =
          scoreField(fields.name, token, 6)
          + scoreField(fields.brand, token, 4)
          + scoreField(fields.category, token, 3.5)
          + scoreField(fields.tags, token, 3)
          + scoreField(fields.description, token, 2)
          + scoreField(fields.sku, token, 2);

        if (tokenScore > 0) {
          matchedTokens += 1;
          totalScore += tokenScore;
        }
      });

      const passesQuery = matchAllTokens ? matchedTokens === tokens.length : matchedTokens > 0;
      return { ...product, _score: passesQuery ? totalScore : 0, _matchesQuery: passesQuery };
    })
    .filter((product) => (hasQuery ? product._matchesQuery : true));
};

export const sortProducts = (products = [], sortBy = 'relevance') => {
  const results = [...products];
  switch (sortBy) {
    case 'relevance':
      return results.sort((a, b) => (b._score || 0) - (a._score || 0));
    case 'price-asc':
      return results.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return results.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'rating':
      return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case 'name-asc':
      return results.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    case 'name-desc':
      return results.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
    case 'popularity':
      return results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    default:
      return results;
  }
};
