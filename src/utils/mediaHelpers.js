import { API_ORIGIN } from '../constants';

const IMAGE_EXTENSION_REGEX = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

const isAbsoluteMediaUrl = (value = '') => (
  /^https?:\/\//i.test(value)
  || value.startsWith('//')
  || value.startsWith('data:image/')
);

export const resolveMediaUrl = (rawUrl = '') => {
  if (typeof rawUrl !== 'string') return '';
  const value = rawUrl.trim();
  if (!value) return '';
  if (isAbsoluteMediaUrl(value)) return value;
  if (!API_ORIGIN) return value;
  if (value.startsWith('/')) {
    return `${API_ORIGIN}${value}`;
  }
  return `${API_ORIGIN}/${value}`;
};

export const isImageValue = (rawValue = '') => (
  typeof rawValue === 'string'
  && (
    isAbsoluteMediaUrl(rawValue)
    || rawValue.startsWith('/uploads/')
    || IMAGE_EXTENSION_REGEX.test(rawValue)
  )
);
