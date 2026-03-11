import { THEME_PRESETS } from '../constants';
import { resolveProductCardSize } from './themeHelpers';

export const HERO_SLIDE_GRADIENTS = [
  { value: 'from-slate-950 via-violet-950 to-slate-900', label: 'Violet Night' },
  { value: 'from-blue-950 via-sky-950 to-slate-950', label: 'Blue Horizon' },
  { value: 'from-emerald-950 via-teal-950 to-slate-950', label: 'Emerald Glow' },
  { value: 'from-amber-950 via-orange-950 to-slate-950', label: 'Amber Heat' },
  { value: 'from-rose-950 via-fuchsia-950 to-slate-950', label: 'Rose Velvet' },
  { value: 'from-slate-950 via-gray-900 to-black', label: 'Mono Graphite' },
];

export const DEFAULT_HERO_SLIDE = {
  id: '',
  badge: '',
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  ctaLink: '/products',
  image: '',
  gradient: HERO_SLIDE_GRADIENTS[0].value,
};

export const DEFAULT_HOMEPAGE = {
  heroSlides: [],
};

const createConfigId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const DEFAULT_SHIPPING_OPTIONS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    description: '3-5 business days',
    baseRate: 10,
    enabled: true,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    freeShippingEligible: true,
    cityRates: [],
  },
  {
    id: 'express',
    label: 'Express Delivery',
    description: '1-2 business days',
    baseRate: 25,
    enabled: true,
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
    freeShippingEligible: false,
    cityRates: [],
  },
  {
    id: 'international',
    label: 'International',
    description: '7-14 business days',
    baseRate: 35,
    enabled: false,
    estimatedDaysMin: 7,
    estimatedDaysMax: 14,
    freeShippingEligible: false,
    cityRates: [],
  },
];

export const DEFAULT_SHIPPING_CONFIG = {
  freeShippingThreshold: 100,
  flatRate: 10,
  expressRate: 25,
  internationalRate: 35,
  enableFreeShipping: true,
  enableExpress: true,
  enableInternational: false,
  options: DEFAULT_SHIPPING_OPTIONS,
  defaultOptionId: 'standard',
};

export const DEFAULT_NAVIGATION_LINK = {
  id: '',
  label: '',
  to: '/products',
  type: 'link',
  badge: '',
  newTab: false,
  isVisible: true,
  children: [],
};

export const DEFAULT_NAVIGATION_CHILD_LINK = {
  id: '',
  label: '',
  to: '/products',
  newTab: false,
  isVisible: true,
};

export const DEFAULT_NAVIGATION = {
  showSearch: true,
  showWishlist: true,
  showCart: true,
  showAuthButtons: true,
  ctaLabel: '',
  ctaLink: '/products',
  links: [
    { id: 'nav-products', label: 'Products', to: '/products', type: 'link', badge: '', newTab: false, isVisible: true },
    { id: 'nav-categories', label: 'Categories', to: '/products', type: 'categories', badge: '', newTab: false, isVisible: true },
    { id: 'nav-deals', label: 'Deals', to: '/search?q=sale', type: 'link', badge: 'Hot', newTab: false, isVisible: true },
    { id: 'nav-blog', label: 'Blog', to: '/blog', type: 'link', badge: '', newTab: false, isVisible: true },
    { id: 'nav-about', label: 'About', to: '/about', type: 'link', badge: '', newTab: false, isVisible: true },
    { id: 'nav-contact', label: 'Contact', to: '/contact', type: 'link', badge: '', newTab: false, isVisible: true },
  ],
};

export const DEFAULT_FOOTER_LINK = {
  id: '',
  label: '',
  to: '/',
  newTab: false,
  isVisible: true,
};

export const DEFAULT_FOOTER_LINK_GROUP = {
  id: '',
  title: '',
  links: [],
};

export const DEFAULT_FOOTER = {
  tagline: '',
  newsletterEnabled: true,
  newsletterTitle: 'Stay in the Loop',
  newsletterDescription: 'Get exclusive deals, launches, and insider updates delivered to your inbox.',
  showSocialLinks: true,
  showContactInfo: true,
  showLegalLinks: true,
  bottomText: '',
  legalLinks: [
    { id: 'legal-privacy', label: 'Privacy Policy', to: '/privacy', newTab: false, isVisible: true },
    { id: 'legal-terms', label: 'Terms of Service', to: '/terms', newTab: false, isVisible: true },
    { id: 'legal-cookies', label: 'Cookie Policy', to: '/cookies', newTab: false, isVisible: true },
  ],
  linkGroups: [
    {
      id: 'footer-shop',
      title: 'Shop',
      links: [
        { id: 'footer-products', label: 'All Products', to: '/products', newTab: false, isVisible: true },
        { id: 'footer-deals', label: 'Deals & Offers', to: '/search?q=sale', newTab: false, isVisible: true },
        { id: 'footer-new', label: 'New Arrivals', to: '/products?sort=created-desc', newTab: false, isVisible: true },
      ],
    },
    {
      id: 'footer-support',
      title: 'Support',
      links: [
        { id: 'footer-about', label: 'About Us', to: '/about', newTab: false, isVisible: true },
        { id: 'footer-contact', label: 'Contact', to: '/contact', newTab: false, isVisible: true },
        { id: 'footer-help', label: 'Help Center', to: '/help', newTab: false, isVisible: true },
        { id: 'footer-faq', label: 'FAQ', to: '/faq', newTab: false, isVisible: true },
        { id: 'footer-shipping', label: 'Shipping', to: '/shipping', newTab: false, isVisible: true },
        { id: 'footer-returns', label: 'Returns', to: '/returns', newTab: false, isVisible: true },
      ],
    },
  ],
};

export const DEFAULT_STORE = {
  name: 'My Store',
  domain: '',
  slug: '',
  description: '',
  email: '',
  phone: '',
  currency: 'USD',
  language: 'en',
  timezone: 'UTC',
  taxRate: 0,
  logoUrl: '',
  faviconUrl: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  shippingConfig: DEFAULT_SHIPPING_CONFIG,
  seo: {
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    pinterest: '',
  },
  homepage: DEFAULT_HOMEPAGE,
  navigation: DEFAULT_NAVIGATION,
  footer: DEFAULT_FOOTER,
};

export const DEFAULT_THEME = THEME_PRESETS.modern;

const getStringValue = (value, fallback = '') => (typeof value === 'string' ? value : fallback);

export function normalizeHomepageHeroSlide(slide = {}, index = 0, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_HERO_SLIDE,
    ...slide,
    id: typeof slide.id === 'string' && slide.id.trim() ? slide.id.trim() : `slide-${index + 1}`,
    badge: preserveDraftText ? getStringValue(slide.badge) : typeof slide.badge === 'string' ? slide.badge.trim() : '',
    // Preserve user-entered line breaks while editing hero copy in admin.
    title: getStringValue(slide.title),
    subtitle: getStringValue(slide.subtitle),
    cta: preserveDraftText
      ? getStringValue(slide.cta)
      : typeof slide.cta === 'string' && slide.cta.trim() ? slide.cta.trim() : DEFAULT_HERO_SLIDE.cta,
    ctaLink: preserveDraftText
      ? getStringValue(slide.ctaLink)
      : typeof slide.ctaLink === 'string' && slide.ctaLink.trim() ? slide.ctaLink.trim() : DEFAULT_HERO_SLIDE.ctaLink,
    image: preserveDraftText ? getStringValue(slide.image) : typeof slide.image === 'string' ? slide.image.trim() : '',
    gradient: typeof slide.gradient === 'string' && slide.gradient.trim() ? slide.gradient.trim() : DEFAULT_HERO_SLIDE.gradient,
  };
}

export function normalizeHomepage(homepage = {}, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_HOMEPAGE,
    ...homepage,
    heroSlides: Array.isArray(homepage.heroSlides)
      ? homepage.heroSlides
        .map((slide, index) => normalizeHomepageHeroSlide(slide, index, options))
        .filter((slide) => (preserveDraftText ? true : Boolean(slide.title)))
      : [],
  };
}

export function normalizeNavigationLink(link = {}, index = 0, options = {}) {
  const { preserveDraftText = false } = options;
  const type = ['categories', 'dropdown'].includes(link?.type) ? link.type : 'link';
  const defaultLabel =
    type === 'categories'
      ? 'Categories'
      : type === 'dropdown'
        ? `Menu ${index + 1}`
        : `Link ${index + 1}`;
  const fallbackTo = type === 'dropdown' ? '' : DEFAULT_NAVIGATION_LINK.to;

  return {
    ...DEFAULT_NAVIGATION_LINK,
    ...link,
    id: typeof link.id === 'string' && link.id.trim() ? link.id.trim() : createConfigId('nav'),
    label: preserveDraftText
      ? getStringValue(link.label)
      : typeof link.label === 'string' && link.label.trim() ? link.label.trim() : defaultLabel,
    to: preserveDraftText
      ? getStringValue(link.to)
      : typeof link.to === 'string' && link.to.trim() ? link.to.trim() : fallbackTo,
    type,
    badge: preserveDraftText ? getStringValue(link.badge) : typeof link.badge === 'string' ? link.badge.trim() : '',
    newTab: Boolean(link.newTab),
    isVisible: link.isVisible !== false,
    children: Array.isArray(link.children)
      ? link.children
        .map((childLink, childIndex) => normalizeNavigationChildLink(childLink, childIndex, options))
        .filter((childLink) => (preserveDraftText ? true : Boolean(childLink.label)))
      : [],
  };
}

export function normalizeNavigationChildLink(link = {}, index = 0, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_NAVIGATION_CHILD_LINK,
    ...link,
    id: typeof link.id === 'string' && link.id.trim() ? link.id.trim() : createConfigId('nav-child'),
    label: preserveDraftText
      ? getStringValue(link.label)
      : typeof link.label === 'string' && link.label.trim() ? link.label.trim() : `Sub Link ${index + 1}`,
    to: preserveDraftText
      ? getStringValue(link.to)
      : typeof link.to === 'string' && link.to.trim() ? link.to.trim() : DEFAULT_NAVIGATION_CHILD_LINK.to,
    newTab: Boolean(link.newTab),
    isVisible: link.isVisible !== false,
  };
}

export function normalizeNavigation(navigation = {}, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_NAVIGATION,
    ...navigation,
    ctaLabel: preserveDraftText ? getStringValue(navigation.ctaLabel) : typeof navigation.ctaLabel === 'string' ? navigation.ctaLabel.trim() : '',
    ctaLink: preserveDraftText
      ? getStringValue(navigation.ctaLink)
      : typeof navigation.ctaLink === 'string' && navigation.ctaLink.trim() ? navigation.ctaLink.trim() : DEFAULT_NAVIGATION.ctaLink,
    showSearch: navigation.showSearch !== false,
    showWishlist: navigation.showWishlist !== false,
    showCart: navigation.showCart !== false,
    showAuthButtons: navigation.showAuthButtons !== false,
    links: Array.isArray(navigation.links)
      ? navigation.links
        .map((link, index) => normalizeNavigationLink(link, index, options))
        .filter((link) => (preserveDraftText ? true : Boolean(link.label)))
      : DEFAULT_NAVIGATION.links.map((link, index) => normalizeNavigationLink(link, index)),
  };
}

export function normalizeFooterLink(link = {}, index = 0, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_FOOTER_LINK,
    ...link,
    id: typeof link.id === 'string' && link.id.trim() ? link.id.trim() : createConfigId('footer-link'),
    label: preserveDraftText
      ? getStringValue(link.label)
      : typeof link.label === 'string' && link.label.trim() ? link.label.trim() : `Link ${index + 1}`,
    to: preserveDraftText
      ? getStringValue(link.to)
      : typeof link.to === 'string' && link.to.trim() ? link.to.trim() : DEFAULT_FOOTER_LINK.to,
    newTab: Boolean(link.newTab),
    isVisible: link.isVisible !== false,
  };
}

export function normalizeFooterLinkGroup(group = {}, index = 0, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_FOOTER_LINK_GROUP,
    ...group,
    id: typeof group.id === 'string' && group.id.trim() ? group.id.trim() : createConfigId('footer-group'),
    title: preserveDraftText
      ? getStringValue(group.title)
      : typeof group.title === 'string' && group.title.trim() ? group.title.trim() : `Group ${index + 1}`,
    links: Array.isArray(group.links)
      ? group.links
        .map((link, linkIndex) => normalizeFooterLink(link, linkIndex, options))
        .filter((link) => (preserveDraftText ? true : Boolean(link.label)))
      : [],
  };
}

export function normalizeFooter(footer = {}, options = {}) {
  const { preserveDraftText = false } = options;

  return {
    ...DEFAULT_FOOTER,
    ...footer,
    tagline: preserveDraftText ? getStringValue(footer.tagline) : typeof footer.tagline === 'string' ? footer.tagline.trim() : '',
    newsletterEnabled: footer.newsletterEnabled !== false,
    newsletterTitle: preserveDraftText
      ? getStringValue(footer.newsletterTitle)
      : typeof footer.newsletterTitle === 'string' && footer.newsletterTitle.trim()
      ? footer.newsletterTitle.trim()
      : DEFAULT_FOOTER.newsletterTitle,
    newsletterDescription: preserveDraftText
      ? getStringValue(footer.newsletterDescription)
      : typeof footer.newsletterDescription === 'string' && footer.newsletterDescription.trim()
      ? footer.newsletterDescription.trim()
      : DEFAULT_FOOTER.newsletterDescription,
    showSocialLinks: footer.showSocialLinks !== false,
    showContactInfo: footer.showContactInfo !== false,
    showLegalLinks: footer.showLegalLinks !== false,
    bottomText: preserveDraftText ? getStringValue(footer.bottomText) : typeof footer.bottomText === 'string' ? footer.bottomText.trim() : '',
    legalLinks: Array.isArray(footer.legalLinks)
      ? footer.legalLinks
        .map((link, index) => normalizeFooterLink(link, index, options))
        .filter((link) => (preserveDraftText ? true : Boolean(link.label)))
      : DEFAULT_FOOTER.legalLinks.map((link, index) => normalizeFooterLink(link, index)),
    linkGroups: Array.isArray(footer.linkGroups)
      ? footer.linkGroups
        .map((group, index) => normalizeFooterLinkGroup(group, index, options))
        .filter((group) => (preserveDraftText ? true : Boolean(group.title)))
      : DEFAULT_FOOTER.linkGroups.map((group, index) => normalizeFooterLinkGroup(group, index)),
  };
}

const normalizeCityRate = (rate = {}, index = 0) => ({
  id: typeof rate.id === 'string' && rate.id.trim() ? rate.id.trim() : createConfigId('ship-city'),
  city: typeof rate.city === 'string' ? rate.city.trim() : '',
  rate: Number.isFinite(Number(rate.rate)) ? Math.max(0, Number(rate.rate)) : 0,
});

const normalizeShippingOption = (option = {}, index = 0) => {
  const fallback = DEFAULT_SHIPPING_OPTIONS[index] || DEFAULT_SHIPPING_OPTIONS[0];

  return {
    id: typeof option.id === 'string' && option.id.trim() ? option.id.trim() : createConfigId('ship'),
    label: typeof option.label === 'string' && option.label.trim() ? option.label.trim() : fallback.label,
    description: typeof option.description === 'string' ? option.description.trim() : fallback.description,
    baseRate: Number.isFinite(Number(option.baseRate)) ? Math.max(0, Number(option.baseRate)) : fallback.baseRate,
    enabled: option.enabled !== false,
    estimatedDaysMin: Number.isFinite(Number(option.estimatedDaysMin))
      ? Math.max(0, parseInt(option.estimatedDaysMin, 10))
      : fallback.estimatedDaysMin,
    estimatedDaysMax: Number.isFinite(Number(option.estimatedDaysMax))
      ? Math.max(0, parseInt(option.estimatedDaysMax, 10))
      : fallback.estimatedDaysMax,
    freeShippingEligible: option.freeShippingEligible !== false,
    cityRates: Array.isArray(option.cityRates)
      ? option.cityRates
        .map((cityRate, rateIndex) => normalizeCityRate(cityRate, rateIndex))
        .filter((cityRate) => cityRate.city)
      : [],
  };
};

const buildDefaultOptionsFromLegacy = (config = {}) => ([
  {
    id: 'standard',
    label: 'Standard Delivery',
    description: '3-5 business days',
    baseRate: Number.isFinite(Number(config.flatRate)) ? Math.max(0, Number(config.flatRate)) : DEFAULT_SHIPPING_CONFIG.flatRate,
    enabled: true,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    freeShippingEligible: true,
    cityRates: [],
  },
  {
    id: 'express',
    label: 'Express Delivery',
    description: '1-2 business days',
    baseRate: Number.isFinite(Number(config.expressRate)) ? Math.max(0, Number(config.expressRate)) : DEFAULT_SHIPPING_CONFIG.expressRate,
    enabled: config.enableExpress !== false,
    estimatedDaysMin: 1,
    estimatedDaysMax: 2,
    freeShippingEligible: false,
    cityRates: [],
  },
  {
    id: 'international',
    label: 'International',
    description: '7-14 business days',
    baseRate: Number.isFinite(Number(config.internationalRate)) ? Math.max(0, Number(config.internationalRate)) : DEFAULT_SHIPPING_CONFIG.internationalRate,
    enabled: Boolean(config.enableInternational),
    estimatedDaysMin: 7,
    estimatedDaysMax: 14,
    freeShippingEligible: false,
    cityRates: [],
  },
]);

export function normalizeShippingConfig(config = {}) {
  const rawOptions = Array.isArray(config.options) ? config.options : null;
  const optionsSource = rawOptions && rawOptions.length > 0
    ? rawOptions
    : buildDefaultOptionsFromLegacy(config);
  const options = optionsSource.map((option, index) => normalizeShippingOption(option, index));

  const defaultOptionCandidate = typeof config.defaultOptionId === 'string'
    ? config.defaultOptionId.trim()
    : '';
  const fallbackDefaultId = options.find((option) => option.enabled)?.id || options[0]?.id || DEFAULT_SHIPPING_CONFIG.defaultOptionId;
  const defaultOptionId = options.some((option) => option.id === defaultOptionCandidate && option.enabled)
    ? defaultOptionCandidate
    : fallbackDefaultId;

  const standardOption = options.find((option) => option.id === 'standard') || options[0];
  const expressOption = options.find((option) => option.id === 'express');
  const internationalOption = options.find((option) => option.id === 'international');

  return {
    ...DEFAULT_SHIPPING_CONFIG,
    ...config,
    freeShippingThreshold: Number.isFinite(Number(config.freeShippingThreshold))
      ? Math.max(0, Number(config.freeShippingThreshold))
      : DEFAULT_SHIPPING_CONFIG.freeShippingThreshold,
    enableFreeShipping: config.enableFreeShipping !== false,
    flatRate: Number.isFinite(Number(config.flatRate))
      ? Math.max(0, Number(config.flatRate))
      : (standardOption?.baseRate ?? DEFAULT_SHIPPING_CONFIG.flatRate),
    expressRate: Number.isFinite(Number(config.expressRate))
      ? Math.max(0, Number(config.expressRate))
      : (expressOption?.baseRate ?? DEFAULT_SHIPPING_CONFIG.expressRate),
    internationalRate: Number.isFinite(Number(config.internationalRate))
      ? Math.max(0, Number(config.internationalRate))
      : (internationalOption?.baseRate ?? DEFAULT_SHIPPING_CONFIG.internationalRate),
    enableExpress: config.enableExpress !== undefined
      ? Boolean(config.enableExpress)
      : Boolean(expressOption ? expressOption.enabled : DEFAULT_SHIPPING_CONFIG.enableExpress),
    enableInternational: config.enableInternational !== undefined
      ? Boolean(config.enableInternational)
      : Boolean(internationalOption ? internationalOption.enabled : DEFAULT_SHIPPING_CONFIG.enableInternational),
    options,
    defaultOptionId,
  };
}

export function normalizeStore(store = {}) {
  return {
    ...DEFAULT_STORE,
    ...store,
    address: {
      ...DEFAULT_STORE.address,
      ...(store.address || {}),
    },
    shippingConfig: normalizeShippingConfig(store.shippingConfig || {}),
    seo: {
      ...DEFAULT_STORE.seo,
      ...(store.seo || {}),
    },
    socialLinks: {
      ...DEFAULT_STORE.socialLinks,
      ...(store.socialLinks || {}),
    },
    homepage: normalizeHomepage(store.homepage || {}),
    navigation: normalizeNavigation(store.navigation || {}),
    footer: normalizeFooter(store.footer || {}),
  };
}

export function normalizeTheme(theme = {}) {
  return {
    ...DEFAULT_THEME,
    ...theme,
    borderRadius: Number.isFinite(Number(theme.borderRadius))
      ? Math.max(0, Number(theme.borderRadius))
      : DEFAULT_THEME.borderRadius,
    productCardSize: resolveProductCardSize(theme.productCardSize),
    productGridRows: Number.isFinite(Number(theme.productGridRows))
      ? Math.min(6, Math.max(1, Number(theme.productGridRows)))
      : DEFAULT_THEME.productGridRows,
    productGridColumnsMobile: Number.isFinite(Number(theme.productGridColumnsMobile))
      ? Math.min(2, Math.max(1, Number(theme.productGridColumnsMobile)))
      : DEFAULT_THEME.productGridColumnsMobile,
    productGridColumnsTablet: Number.isFinite(Number(theme.productGridColumnsTablet))
      ? Math.min(6, Math.max(1, Number(theme.productGridColumnsTablet)))
      : DEFAULT_THEME.productGridColumnsTablet,
    productGridColumnsDesktop: Number.isFinite(Number(theme.productGridColumnsDesktop))
      ? Math.min(10, Math.max(1, Number(theme.productGridColumnsDesktop)))
      : DEFAULT_THEME.productGridColumnsDesktop,
  };
}

export function formatStoreAddress(address) {
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [
    address.street,
    [address.city, address.state, address.zipCode].filter(Boolean).join(', '),
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

export function isExternalStoreLink(link = '') {
  return /^(https?:\/\/|mailto:|tel:)/i.test(link);
}
