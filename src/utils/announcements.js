import { resolveAnnouncementTemplateKey } from './announcementTemplates';
import {
  applyAnnouncementPlacementConstraints,
  getAnnouncementFieldCharacterCount,
  getAnnouncementPlacementRule,
} from './announcementConstraints';

const ANNOUNCEMENT_DISMISSALS_KEY = 'dismissedAnnouncements.v2';
const ANNOUNCEMENT_SCOPE_PREFIX = 'announcement-scope';

const normalizeAnnouncementLocation = (value) => {
  const normalized = String(value || 'HEADER').toUpperCase();
  if (normalized === 'HEADER_DROPDOWN') return 'CATEGORY_DROPDOWN';
  return normalized;
};

export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: 'info', label: 'Information' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'product', label: 'Product' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'feature', label: 'Feature' },
];

export const ANNOUNCEMENT_LOCATION_OPTIONS = [
  { value: 'HEADER', label: 'Header bar' },
  { value: 'CATEGORY_DROPDOWN', label: 'Category dropdown (header)' },
  { value: 'HOMEPAGE', label: 'Homepage banner' },
  { value: 'PRODUCT_PAGES', label: 'Product pages' },
  { value: 'CHECKOUT', label: 'Checkout page' },
  { value: 'CATEGORIES', label: 'Category pages' },
  { value: 'ALL', label: 'All pages banner/popup' },
  { value: 'SECTION', label: 'Specific homepage section' },
];

export const ANNOUNCEMENT_STYLE_OPTIONS = [
  { value: 'BANNER', label: 'Banner' },
  { value: 'POPUP', label: 'Popup' },
  { value: 'MODAL', label: 'Modal' },
  { value: 'SLIDE_IN', label: 'Slide in' },
  { value: 'STICKY', label: 'Sticky bar' },
];

export const TARGET_AUDIENCE_TO_ROLE = {
  all: null,
  customers: 'CUSTOMER',
  admins: 'ADMIN',
};

export const ROLE_TO_TARGET_AUDIENCE = {
  ADMIN: 'admins',
  SUPER_ADMIN: 'admins',
  CUSTOMER: 'customers',
};

export function createEmptyAnnouncement(overrides = {}) {
  return applyAnnouncementPlacementConstraints({
    templateKey: 'header-free-shipping',
    title: '',
    content: '',
    type: 'info',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    displayLocation: 'HEADER',
    displayStyle: 'BANNER',
    priority: 50,
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    countdownEnabled: false,
    sectionId: '',
    customCss: '',
    showMeta: false,
    isActive: true,
    ...overrides,
  });
}

export function normalizeAnnouncement(rawAnnouncement = {}) {
  const displayLocation = normalizeAnnouncementLocation(rawAnnouncement.displayLocation);
  const displayStyle = String(rawAnnouncement.displayStyle || 'BANNER').toUpperCase();

  return {
    ...rawAnnouncement,
    id: rawAnnouncement.id,
    title: typeof rawAnnouncement.title === 'string' ? rawAnnouncement.title.trim() : '',
    content: typeof rawAnnouncement.content === 'string' ? rawAnnouncement.content.trim() : '',
    type: String(rawAnnouncement.type || 'INFO').toUpperCase(),
    targetRole: rawAnnouncement.targetRole || null,
    isActive: rawAnnouncement.isActive !== false,
    startsAt: rawAnnouncement.startsAt || null,
    endsAt: rawAnnouncement.endsAt || null,
    displayLocation,
    displayStyle,
    templateKey: resolveAnnouncementTemplateKey({
      ...rawAnnouncement,
      displayLocation,
      displayStyle,
    }),
    priority: Number(rawAnnouncement.priority) || 0,
    imageUrl: rawAnnouncement.imageUrl || '',
    buttonText: rawAnnouncement.buttonText || '',
    buttonLink: rawAnnouncement.buttonLink || '',
    countdownEnabled: Boolean(rawAnnouncement.countdownEnabled),
    sectionId: rawAnnouncement.sectionId || '',
    customCss: rawAnnouncement.customCss || '',
    showMeta: Boolean(rawAnnouncement.showMeta),
    createdAt: rawAnnouncement.createdAt || null,
    updatedAt: rawAnnouncement.updatedAt || null,
  };
}

export function getAnnouncementStatus(announcement, now = new Date()) {
  const normalized = normalizeAnnouncement(announcement);
  const startsAt = normalized.startsAt ? new Date(normalized.startsAt) : null;
  const endsAt = normalized.endsAt ? new Date(normalized.endsAt) : null;

  if (!normalized.isActive) return 'draft';
  if (startsAt && startsAt > now) return 'scheduled';
  if (endsAt && endsAt < now) return 'expired';
  return 'active';
}

export function isAnnouncementActive(announcement, now = new Date()) {
  return getAnnouncementStatus(announcement, now) === 'active';
}

export function resolveAnnouncementSurfaces(pathname = '/') {
  const normalizedPath = pathname || '/';
  const surfaces = ['ALL'];

  if (normalizedPath === '/') {
    surfaces.push('HOMEPAGE');
  }

  if (normalizedPath.startsWith('/products')) {
    surfaces.push('PRODUCT_PAGES');
  }

  if (normalizedPath.startsWith('/checkout')) {
    surfaces.push('CHECKOUT');
  }

  if (normalizedPath.startsWith('/categories')) {
    surfaces.push('CATEGORIES');
  }

  return surfaces;
}

export function filterAnnouncements(items = [], context = {}) {
  const now = context.now || new Date();
  const surfaces = context.surfaces || [];
  const styles = context.styles || null;
  const sectionIds = context.sectionIds || [];
  const viewerRole = context.viewerRole || null;
  const dismissedTokens = context.dismissedTokens || [];

  return items
    .map(normalizeAnnouncement)
    .filter((announcement) => isAnnouncementActive(announcement, now))
    .filter((announcement) => matchesAnnouncementAudience(announcement, viewerRole))
    .filter((announcement) => matchesAnnouncementPlacement(announcement, surfaces, sectionIds))
    .filter((announcement) => matchesAnnouncementStyle(announcement, styles))
    .filter((announcement) => !dismissedTokens.includes(getAnnouncementDismissalToken(announcement)))
    .sort(sortAnnouncements);
}

export function sortAnnouncements(left, right) {
  if ((right.priority || 0) !== (left.priority || 0)) {
    return (right.priority || 0) - (left.priority || 0);
  }

  const leftStartsAt = left.startsAt ? new Date(left.startsAt).getTime() : 0;
  const rightStartsAt = right.startsAt ? new Date(right.startsAt).getTime() : 0;
  if (leftStartsAt !== rightStartsAt) {
    return leftStartsAt - rightStartsAt;
  }

  const leftUpdatedAt = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
  const rightUpdatedAt = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
  return rightUpdatedAt - leftUpdatedAt;
}

export function matchesAnnouncementAudience(announcement, viewerRole) {
  const targetRole = announcement.targetRole || null;
  if (!targetRole) return true;
  if (viewerRole === 'ADMIN' || viewerRole === 'SUPER_ADMIN') return targetRole === 'ADMIN';
  if (viewerRole === 'CUSTOMER') return targetRole === 'CUSTOMER';
  return false;
}

export function matchesAnnouncementPlacement(announcement, surfaces = [], sectionIds = []) {
  if (announcement.displayLocation === 'SECTION') {
    return (
      surfaces.includes('SECTION')
      && sectionIds.some((sectionId) => String(sectionId) === String(announcement.sectionId))
    );
  }

  return surfaces.includes(announcement.displayLocation);
}

export function matchesAnnouncementStyle(announcement, styles) {
  if (!Array.isArray(styles) || styles.length === 0) {
    return true;
  }

  return styles.includes(announcement.displayStyle);
}

export function getAnnouncementDismissalToken(announcement) {
  const version = announcement.updatedAt || announcement.createdAt || 'base';
  return `${announcement.id}:${version}`;
}

export function getAnnouncementScopeClassName(announcement) {
  const rawIdentifier = [
    announcement?.id,
    announcement?.templateKey,
    announcement?.displayLocation,
    announcement?.displayStyle,
  ]
    .filter(Boolean)
    .join('-')
    .toLowerCase();

  const safeIdentifier = rawIdentifier.replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${ANNOUNCEMENT_SCOPE_PREFIX}-${safeIdentifier || 'default'}`;
}

export function getAnnouncementScopedCss(announcement) {
  const customCss = typeof announcement?.customCss === 'string' ? announcement.customCss.trim() : '';
  if (!customCss) return '';

  const scopeClassName = getAnnouncementScopeClassName(announcement);

  if (customCss.includes('.announcement')) {
    return customCss.replace(/\.announcement\b/g, `.${scopeClassName}`);
  }

  if (!customCss.includes('{')) {
    return `.${scopeClassName} { ${customCss} }`;
  }

  return customCss;
}

export function readDismissedAnnouncementTokens() {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(ANNOUNCEMENT_DISMISSALS_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.warn('Failed to read dismissed announcements:', error);
    return [];
  }
}

export function writeDismissedAnnouncementTokens(tokens) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(ANNOUNCEMENT_DISMISSALS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.warn('Failed to persist dismissed announcements:', error);
  }
}

export function getCountdownParts(announcement, now = new Date()) {
  const endsAt = announcement?.endsAt ? new Date(announcement.endsAt) : null;
  if (!announcement?.countdownEnabled || !endsAt || Number.isNaN(endsAt.getTime())) {
    return null;
  }

  const diff = endsAt.getTime() - now.getTime();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function formatDate(value, fallback = 'Not set') {
  if (!value) return fallback;
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return fallback;
  return parsedDate.toLocaleDateString();
}

export function formatDateTime(value, fallback = 'Not set') {
  if (!value) return fallback;
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return fallback;
  return parsedDate.toLocaleString();
}

export function toDateTimeInputValue(value) {
  if (!value) return '';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const offset = parsedDate.getTimezoneOffset();
  const localDate = new Date(parsedDate.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function deserializeAnnouncementForForm(rawAnnouncement = {}) {
  const announcement = normalizeAnnouncement(rawAnnouncement);

  return createEmptyAnnouncement({
    templateKey: announcement.templateKey,
    title: announcement.title,
    content: announcement.content,
    type: announcement.type.toLowerCase(),
    startDate: toDateTimeInputValue(announcement.startsAt),
    endDate: toDateTimeInputValue(announcement.endsAt),
    targetAudience: ROLE_TO_TARGET_AUDIENCE[announcement.targetRole] || 'all',
    displayLocation: announcement.displayLocation,
    displayStyle: announcement.displayStyle,
    priority: announcement.priority,
    imageUrl: announcement.imageUrl,
    buttonText: announcement.buttonText,
    buttonLink: announcement.buttonLink,
    countdownEnabled: announcement.countdownEnabled,
    sectionId: announcement.sectionId,
    customCss: announcement.customCss,
    showMeta: announcement.showMeta,
    isActive: announcement.isActive,
  });
}

export function serializeAnnouncementForApi(formAnnouncement) {
  const constrainedAnnouncement = applyAnnouncementPlacementConstraints(formAnnouncement);
  const placementRule = getAnnouncementPlacementRule(
    constrainedAnnouncement.displayLocation,
    constrainedAnnouncement.displayStyle
  );

  return {
    templateKey: resolveAnnouncementTemplateKey(constrainedAnnouncement),
    title: normalizeSingleLineText(constrainedAnnouncement.title).trim(),
    content: placementRule.fields.content.enabled ? normalizeFormText(constrainedAnnouncement.content) : null,
    type: String(constrainedAnnouncement.type || 'info').toUpperCase(),
    targetRole: TARGET_AUDIENCE_TO_ROLE[constrainedAnnouncement.targetAudience] || null,
    isActive: Boolean(constrainedAnnouncement.isActive),
    startsAt: serializeInputDateTime(constrainedAnnouncement.startDate),
    endsAt: serializeInputDateTime(constrainedAnnouncement.endDate),
    displayLocation: placementRule.displayLocation,
    displayStyle: placementRule.displayStyle,
    priority: clampPriority(constrainedAnnouncement.priority),
    imageUrl: placementRule.fields.imageUrl.enabled ? normalizeFormText(constrainedAnnouncement.imageUrl) : null,
    buttonText: normalizeFormText(normalizeSingleLineText(constrainedAnnouncement.buttonText)),
    buttonLink: placementRule.fields.buttonLink.enabled ? normalizeFormText(constrainedAnnouncement.buttonLink) : null,
    countdownEnabled: placementRule.fields.countdownEnabled.enabled ? Boolean(constrainedAnnouncement.countdownEnabled) : false,
    sectionId: placementRule.fields.sectionId.enabled ? normalizeFormText(constrainedAnnouncement.sectionId) : null,
    customCss: placementRule.fields.customCss.enabled ? normalizeFormText(constrainedAnnouncement.customCss) : null,
    showMeta: Boolean(constrainedAnnouncement.showMeta),
  };
}

export function validateAnnouncementForm(formAnnouncement) {
  const errors = {};
  const payload = serializeAnnouncementForApi(formAnnouncement);
  const placementRule = getAnnouncementPlacementRule(payload.displayLocation, payload.displayStyle);

  if (!payload.title) {
    errors.title = 'Title is required.';
  }

  if (getAnnouncementFieldCharacterCount(payload.title) > placementRule.fields.title.maxLength) {
    errors.title = `${placementRule.fields.title.label} must be ${placementRule.fields.title.maxLength} characters or fewer.`;
  }

  if (payload.displayLocation === 'SECTION' && payload.displayStyle !== 'BANNER') {
    errors.displayStyle = 'Section announcements must use the banner style.';
  }

  if (payload.displayLocation === 'HEADER' && payload.displayStyle !== 'BANNER') {
    errors.displayStyle = 'Top announcement bars only support the banner style.';
  }

  if (payload.displayLocation === 'CATEGORY_DROPDOWN' && payload.displayStyle !== 'BANNER') {
    errors.displayStyle = 'Category dropdown announcements only support the banner style.';
  }

  if (payload.displayLocation === 'SECTION' && !payload.sectionId) {
    errors.sectionId = 'Choose a target section.';
  }

  if (!placementRule.fields.content.enabled && payload.content) {
    errors.content = 'This placement does not support supporting content.';
  }

  if (placementRule.fields.content.enabled && payload.content
    && getAnnouncementFieldCharacterCount(payload.content) > placementRule.fields.content.maxLength) {
    errors.content = `Content must be ${placementRule.fields.content.maxLength} characters or fewer.`;
  }

  if (payload.countdownEnabled && !payload.endsAt) {
    errors.endDate = 'End date is required when countdown is enabled.';
  }

  if (!placementRule.fields.countdownEnabled.enabled && formAnnouncement.countdownEnabled) {
    errors.countdownEnabled = 'This placement does not support countdown timers.';
  }

  if ((payload.buttonText && !payload.buttonLink) || (!payload.buttonText && payload.buttonLink)) {
    errors.button = 'Button text and button link must be set together.';
  }

  if (payload.buttonText && getAnnouncementFieldCharacterCount(payload.buttonText) > placementRule.fields.buttonText.maxLength) {
    errors.button = `Button text must be ${placementRule.fields.buttonText.maxLength} characters or fewer.`;
  }

  if (payload.buttonLink && !isValidAnnouncementLink(payload.buttonLink)) {
    errors.button = 'Button link must be an internal path or a valid http, https, mailto, or tel link.';
  }

  if (payload.buttonLink && getAnnouncementFieldCharacterCount(payload.buttonLink) > placementRule.fields.buttonLink.maxLength) {
    errors.button = `Button link must be ${placementRule.fields.buttonLink.maxLength} characters or fewer.`;
  }

  if (payload.imageUrl && !isValidAnnouncementImageUrl(payload.imageUrl)) {
    errors.imageUrl = 'Image URL must be a valid http, https, data URI, or site-relative path.';
  }

  if (payload.imageUrl && getAnnouncementFieldCharacterCount(payload.imageUrl) > placementRule.fields.imageUrl.maxLength) {
    errors.imageUrl = `Image URL must be ${placementRule.fields.imageUrl.maxLength} characters or fewer.`;
  }

  if (!placementRule.fields.customCss.enabled && formAnnouncement.customCss?.trim()) {
    errors.customCss = 'This placement does not support custom CSS.';
  }

  if (payload.customCss && getAnnouncementFieldCharacterCount(payload.customCss) > placementRule.fields.customCss.maxLength) {
    errors.customCss = `Custom CSS must be ${placementRule.fields.customCss.maxLength} characters or fewer.`;
  }

  if (payload.startsAt && payload.endsAt) {
    const startDate = new Date(payload.startsAt);
    const endDate = new Date(payload.endsAt);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate < startDate) {
      errors.endDate = 'End date must be after the start date.';
    }
  }

  return errors;
}

export function isExternalAnnouncementLink(url = '') {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

export function isValidAnnouncementLink(url = '') {
  return /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(url);
}

export function isValidAnnouncementImageUrl(url = '') {
  return /^(\/(?!\/)|https?:\/\/|data:image\/)/i.test(url);
}

function normalizeFormText(value) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeSingleLineText(value) {
  if (typeof value !== 'string') return value ?? '';
  return value.replace(/\s+/g, ' ');
}

function serializeInputDateTime(value) {
  if (!value) return null;
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate.toISOString();
}

function clampPriority(value) {
  const numericValue = parseInt(value, 10);
  if (Number.isNaN(numericValue)) return 0;
  return Math.max(0, Math.min(100, numericValue));
}
