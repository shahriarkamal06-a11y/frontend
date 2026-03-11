import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getThemeDisplayFont } from './themeHelpers';
import { normalizeTheme } from './storeSettings';

// Utility for merging Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(parsedDate);
}

// Format relative time
export function formatRelativeTime(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

// Generate slug from string
export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Deep clone object
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// Calculate discount percentage
export function calculateDiscountPercentage(originalPrice, salePrice) {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Generate random ID
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Truncate text
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Apply theme to CSS variables
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const generateColorScale = (baseColor) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return {};
  
  const { r, g, b } = rgb;
  return {
    50: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`,
    100: `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`,
    200: `rgb(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)})`,
    300: `rgb(${Math.min(255, r + 10)}, ${Math.min(255, g + 10)}, ${Math.min(255, b + 10)})`,
    400: `rgb(${r}, ${g}, ${b})`,
    500: baseColor,
    600: `rgb(${Math.max(0, r - 10)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 10)})`,
    700: `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`,
    800: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`,
    900: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`
  };
};

export function getThemeCssVars(theme = {}) {
  const nextTheme = normalizeTheme(theme || {});
  const primaryScale = generateColorScale(nextTheme.primaryColor);
  const secondaryScale = generateColorScale(nextTheme.secondaryColor);
  const cssVars = {};

  Object.entries(primaryScale).forEach(([shade, color]) => {
    cssVars[`--color-primary-${shade}`] = color;
  });

  Object.entries(secondaryScale).forEach(([shade, color]) => {
    cssVars[`--color-secondary-${shade}`] = color;
  });

  cssVars['--color-accent'] = nextTheme.accentColor;
  cssVars['--color-background'] = nextTheme.backgroundColor;
  cssVars['--color-foreground'] = nextTheme.textColor;
  cssVars['--font-family'] = nextTheme.fontFamily;
  cssVars['--font-display'] = getThemeDisplayFont(nextTheme.fontFamily);
  cssVars['--border-radius'] = `${nextTheme.borderRadius}px`;

  return cssVars;
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const nextTheme = normalizeTheme(theme || {});
  const cssVars = getThemeCssVars(nextTheme);

  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.dataset.themeButtonStyle = nextTheme.buttonStyle || 'rounded';
  root.dataset.themeHeaderStyle = nextTheme.headerStyle || 'modern';
  root.dataset.themeFooterLayout = nextTheme.footerLayout || 'detailed';
  root.dataset.themeLayoutType = nextTheme.layoutType || 'grid';
  root.dataset.themeProductCardVariant = nextTheme.productCardVariant || 'editorial';
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};
