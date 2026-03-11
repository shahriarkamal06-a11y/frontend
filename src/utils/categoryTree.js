const DEFAULT_SEPARATOR = ' / ';

const normalizeSortOrder = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const sortCategoryNodes = (left, right) => {
  const orderA = normalizeSortOrder(left?.sortOrder);
  const orderB = normalizeSortOrder(right?.sortOrder);
  if (orderA !== orderB) return orderA - orderB;
  return String(left?.name || '').localeCompare(String(right?.name || ''), undefined, {
    sensitivity: 'base',
  });
};

export const buildCategoryTree = (categories = [], options = {}) => {
  const { includeInactive = true } = options;
  const nodesById = new Map();

  categories.forEach((category) => {
    if (!category || !category.id) return;
    if (!includeInactive && category.isActive === false) return;
    nodesById.set(category.id, {
      ...category,
      parentId: category.parentId || null,
      sortOrder: normalizeSortOrder(category.sortOrder),
      children: [],
    });
  });

  const roots = [];

  nodesById.forEach((category) => {
    if (category.parentId && nodesById.has(category.parentId)) {
      nodesById.get(category.parentId).children.push(category);
    } else {
      roots.push(category);
    }
  });

  const sortBranch = (nodes, visited = new Set()) => {
    nodes.sort(sortCategoryNodes);
    nodes.forEach((node) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      if (node.children && node.children.length > 0) {
        sortBranch(node.children, visited);
      }
    });
  };

  sortBranch(roots);
  return roots;
};

export const flattenCategoryTree = (nodes = [], options = {}) => {
  const { includeInactive = true, separator = DEFAULT_SEPARATOR } = options;
  const result = [];

  const walk = (node, depth, path, ancestors) => {
    if (!node || ancestors.has(node.id)) return;
    if (!includeInactive && node.isActive === false) return;

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(node.id);

    const currentPath = [...path, node.name].filter(Boolean);
    result.push({
      ...node,
      depth,
      path: currentPath,
      pathLabel: currentPath.join(separator),
    });

    (node.children || []).forEach((child) => walk(child, depth + 1, currentPath, nextAncestors));
  };

  nodes.forEach((node) => walk(node, 0, [], new Set()));
  return result;
};

export const buildCategoryIndex = (categories = []) => {
  const byId = new Map();
  const bySlug = new Map();
  const childrenByParent = new Map();

  categories.forEach((category) => {
    if (!category || !category.id) return;
    byId.set(category.id, category);
    if (category.slug) {
      bySlug.set(category.slug, category);
    }

    const parentKey = category.parentId || null;
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey).push(category);
  });

  childrenByParent.forEach((list) => {
    list.sort(sortCategoryNodes);
  });

  return { byId, bySlug, childrenByParent };
};

export const getCategoryAncestors = (categories = [], categoryId) => {
  if (!categoryId) return [];
  const { byId } = buildCategoryIndex(categories);
  const ancestors = [];
  let current = byId.get(categoryId);
  const visited = new Set();

  while (current?.parentId && !visited.has(current.parentId)) {
    visited.add(current.parentId);
    const parent = byId.get(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
};

export const getCategoryDescendants = (categories = [], categoryId) => {
  if (!categoryId) return [];
  const { childrenByParent } = buildCategoryIndex(categories);
  const result = [];
  const stack = [...(childrenByParent.get(categoryId) || [])];
  const visited = new Set();

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || visited.has(node.id)) continue;
    visited.add(node.id);
    result.push(node);
    const children = childrenByParent.get(node.id) || [];
    stack.push(...children);
  }

  return result;
};

export const getCategoryOptionLabel = (category = {}) => {
  const depth = Number.isFinite(category.depth) ? category.depth : 0;
  const prefix = depth > 0 ? `${'-- '.repeat(depth)}` : '';
  return `${prefix}${category.name || category.label || ''}`.trim();
};

