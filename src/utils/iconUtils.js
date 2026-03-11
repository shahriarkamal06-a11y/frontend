import * as LucideIcons from 'lucide-react';
import {
  Star,
  Sparkles,
  TrendingUp,
  Zap,
  Flame,
  Package,
  Heart,
  Gift,
  ShoppingBag,
  Crown,
  Award,
  Target,
  ArrowDownUp,
} from 'lucide-react';

const ICON_NAME_MAP = Object.keys(LucideIcons).reduce((acc, key) => {
  if (typeof LucideIcons[key] === 'function') {
    acc[key.toLowerCase()] = key;
  }
  return acc;
}, {});

const ICON_ALIASES = {
  flashsale: 'Zap',
  flash: 'Zap',
  featured: 'Star',
  bestselling: 'TrendingUp',
  bestsellers: 'TrendingUp',
  bestseller: 'TrendingUp',
  newarrivals: 'Sparkles',
  newarrival: 'Sparkles',
  trending: 'Flame',
};

const toPascalCase = (value) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

const extractIconToken = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  // Supports values like "<TrendingUp />"
  if (trimmed.startsWith('<')) {
    const match = trimmed.match(/^<\s*([A-Za-z][A-Za-z0-9_-]*)/);
    return match?.[1] || '';
  }

  // Supports values like "TrendingUp()" or "lucide.TrendingUp"
  const firstChunk = trimmed.split(/[()\s]/)[0] || '';
  const dotParts = firstChunk.split('.');
  return dotParts[dotParts.length - 1] || '';
};

// Available icons for sections
export const AVAILABLE_ICONS = [
  { name: 'Star', component: Star },
  { name: 'Sparkles', component: Sparkles },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Zap', component: Zap },
  { name: 'Flame', component: Flame },
  { name: 'Package', component: Package },
  { name: 'Heart', component: Heart },
  { name: 'Gift', component: Gift },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Crown', component: Crown },
  { name: 'Award', component: Award },
  { name: 'Target', component: Target },
  { name: 'ArrowDownUp', component: ArrowDownUp },
];

export const normalizeIconName = (iconName) => {
  const token = extractIconToken(iconName).replace(/[^A-Za-z0-9_-]/g, '');
  if (!token) return '';

  if (token.includes('-') || token.includes('_')) {
    return toPascalCase(token);
  }

  return token;
};

const resolveIconName = (iconName) => {
  const normalized = normalizeIconName(iconName);
  if (!normalized) return '';

  const lowered = normalized.toLowerCase();
  if (ICON_ALIASES[lowered]) return ICON_ALIASES[lowered];

  return ICON_NAME_MAP[lowered] || normalized;
};

export const getIconComponent = (iconName, fallbackName = 'Package') => {
  const resolved = resolveIconName(iconName);
  const fallback = resolveIconName(fallbackName) || 'Package';

  const icon = LucideIcons[resolved];
  if (typeof icon === 'function') return icon;

  const fallbackIcon = LucideIcons[fallback];
  return typeof fallbackIcon === 'function' ? fallbackIcon : Package;
};
