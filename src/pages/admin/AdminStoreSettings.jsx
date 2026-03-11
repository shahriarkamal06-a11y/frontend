import { useState, useEffect, useCallback } from 'react';
import {
    Store, Palette, Globe, Truck, Share2, Search, Save, Upload,
    RotateCcw, AlertCircle, Image, Type, MapPin, Phone, Mail,
    Clock, DollarSign, Percent, Plus, Trash2, ChevronUp, ChevronDown, Check
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { storeAPI, uploadAPI } from '../../services/api';
import { THEME_PRESETS, CURRENCIES, LANGUAGES } from '../../constants';
import { useStoreSettingsStore } from '../../store';
import { PRODUCT_CARD_COMPONENTS, ProductListCard } from '../../components/products/cardVariants';
import {
    DEFAULT_HERO_SLIDE,
    HERO_SLIDE_GRADIENTS,
    normalizeFooter,
    normalizeFooterLink,
    normalizeFooterLinkGroup,
    normalizeHomepageHeroSlide,
    normalizeNavigation,
    normalizeNavigationChildLink,
    normalizeNavigationLink,
    DEFAULT_SHIPPING_CONFIG,
    normalizeStore,
    normalizeTheme,
} from '../../utils/storeSettings';
import {
    BUTTON_STYLE_OPTIONS,
    FOOTER_LAYOUT_OPTIONS,
    getNormalizedProductGridConfig,
    getProductGridClassName,
    HEADER_STYLE_OPTIONS,
    PRODUCT_CARD_SIZE_OPTIONS,
    PRODUCT_CARD_VARIANT_OPTIONS,
    getProductGridPageSize,
    PRODUCT_LAYOUT_OPTIONS,
    resolveProductCardVariant,
    resolveProductLayout,
    THEME_FONT_OPTIONS,
} from '../../utils/themeHelpers';

const DRAFT_NORMALIZE_OPTIONS = { preserveDraftText: true };
const FEATURED_PREVIEW_PRODUCTS = [
    {
        id: 'preview-1',
        name: 'Nimbus Travel Backpack',
        slug: 'nimbus-travel-backpack',
        price: 128,
        comparePrice: 160,
        rating: 4.8,
        reviewCount: 124,
        brand: 'Aero',
        category: 'Bags',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Weatherproof carry-on with modular storage and hidden tech sleeve.',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop&q=80'],
        isFlashSale: true,
    },
    {
        id: 'preview-2',
        name: 'Solstice Knit Sneaker',
        slug: 'solstice-knit-sneaker',
        price: 96,
        comparePrice: 120,
        rating: 4.6,
        reviewCount: 89,
        brand: 'Northway',
        category: 'Footwear',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Lightweight knit upper with all-day cushioning and rebound.',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80'],
    },
    {
        id: 'preview-3',
        name: 'Aurora Ceramic Mug',
        slug: 'aurora-ceramic-mug',
        price: 24,
        comparePrice: 32,
        rating: 4.9,
        reviewCount: 312,
        brand: 'Morning Co.',
        category: 'Home',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Hand-glazed ceramic with a soft matte finish and 14oz capacity.',
        images: ['https://images.unsplash.com/photo-1503602642458-232111445657?w=900&auto=format&fit=crop&q=80'],
    },
    {
        id: 'preview-4',
        name: 'Atlas Performance Jacket',
        slug: 'atlas-performance-jacket',
        price: 189,
        comparePrice: 230,
        rating: 4.7,
        reviewCount: 64,
        brand: 'Summit',
        category: 'Outerwear',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Four-way stretch shell with breathable insulation.',
        images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=80'],
    },
    {
        id: 'preview-5',
        name: 'Signal Wireless Earbuds',
        slug: 'signal-wireless-earbuds',
        price: 149,
        comparePrice: 179,
        rating: 4.5,
        reviewCount: 201,
        brand: 'Pulse',
        category: 'Audio',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Noise-canceling earbuds with 30-hour battery life.',
        images: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&auto=format&fit=crop&q=80'],
    },
    {
        id: 'preview-6',
        name: 'Evergreen Linen Duvet',
        slug: 'evergreen-linen-duvet',
        price: 210,
        comparePrice: 260,
        rating: 4.4,
        reviewCount: 52,
        brand: 'Oak & Loft',
        category: 'Bedding',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Stone-washed linen with a relaxed, airy feel.',
        images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop&q=80'],
    },
    {
        id: 'preview-7',
        name: 'Lumen Desk Lamp',
        slug: 'lumen-desk-lamp',
        price: 78,
        comparePrice: 98,
        rating: 4.6,
        reviewCount: 43,
        brand: 'Studio',
        category: 'Lighting',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Touch-dimmable lamp with warm LED glow.',
        images: ['https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=900&auto=format&fit=crop&q=80'],
    },
    {
        id: 'preview-8',
        name: 'Cascade Everyday Tote',
        slug: 'cascade-everyday-tote',
        price: 88,
        comparePrice: 110,
        rating: 4.3,
        reviewCount: 29,
        brand: 'Field',
        category: 'Accessories',
        section: 'featured',
        sectionName: 'Featured',
        shortDescription: 'Structured canvas tote with premium leather straps.',
        images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80'],
    },
];

const buildColorScale = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!result) {
        return {};
    }

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return {
        50: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`,
        100: `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`,
        200: `rgb(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)})`,
        300: `rgb(${Math.min(255, r + 10)}, ${Math.min(255, g + 10)}, ${Math.min(255, b + 10)})`,
        400: `rgb(${r}, ${g}, ${b})`,
        500: hex,
        600: `rgb(${Math.max(0, r - 10)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 10)})`,
        700: `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`,
        800: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`,
        900: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
    };
};

const getPreviewThemeStyles = (theme = {}) => {
    const primaryScale = buildColorScale(theme.primaryColor);
    const secondaryScale = buildColorScale(theme.secondaryColor);
    const styles = {
        '--color-accent': theme.accentColor,
        '--color-background': theme.backgroundColor,
        '--color-foreground': theme.textColor,
        '--border-radius': `${theme.borderRadius}px`,
        '--font-family': theme.fontFamily,
        fontFamily: theme.fontFamily,
    };

    Object.entries(primaryScale).forEach(([shade, color]) => {
        styles[`--color-primary-${shade}`] = color;
    });
    Object.entries(secondaryScale).forEach(([shade, color]) => {
        styles[`--color-secondary-${shade}`] = color;
    });

    return styles;
};

const cloneShippingConfig = (config = DEFAULT_SHIPPING_CONFIG) => ({
    ...config,
    options: Array.isArray(config.options)
        ? config.options.map((option) => ({
            ...option,
            cityRates: Array.isArray(option.cityRates)
                ? option.cityRates.map((rate) => ({ ...rate }))
                : [],
        }))
        : [],
});

const AdminStoreSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [uploadingSlideId, setUploadingSlideId] = useState('');
    const [editingNavLinkId, setEditingNavLinkId] = useState('');
    const [navDraft, setNavDraft] = useState(null);
    const [editingFooterGroupId, setEditingFooterGroupId] = useState('');
    const [footerGroupDraft, setFooterGroupDraft] = useState(null);
    const [editingFooterLegalId, setEditingFooterLegalId] = useState('');
    const [footerLegalDraft, setFooterLegalDraft] = useState(null);
    const [editingHeroSlideId, setEditingHeroSlideId] = useState('');
    const [heroSlideDraft, setHeroSlideDraft] = useState(null);
    const [editingShippingOptionId, setEditingShippingOptionId] = useState('');
    const [shippingOptionDraft, setShippingOptionDraft] = useState(null);
    const setSettings = useStoreSettingsStore((state) => state.setSettings);

    // Store data state
    const [storeData, setStoreData] = useState({
        name: '',
        slug: '',
        domain: '',
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
        shippingConfig: cloneShippingConfig(),
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
        homepage: {
            heroSlides: [],
        },
        navigation: normalizeNavigation({}, DRAFT_NORMALIZE_OPTIONS),
        footer: normalizeFooter({}, DRAFT_NORMALIZE_OPTIONS),
    });

    // Theme data state
    const [themeData, setThemeData] = useState({
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 8,
        buttonStyle: 'rounded',
        headerStyle: 'modern',
        footerLayout: 'detailed',
        layoutType: 'grid',
        productCardVariant: 'editorial',
        productCardSize: 'comfortable',
        productGridRows: 4,
        productGridColumnsMobile: 2,
        productGridColumnsTablet: 3,
        productGridColumnsDesktop: 3,
    });

    const loadStoreData = useCallback(async ({ showLoader = true } = {}) => {
        if (showLoader) {
            setIsLoading(true);
        }

        try {
            let normalizedStore = normalizeStore({});
            let normalizedTheme = normalizeTheme({});

            try {
                const settingsRes = await storeAPI.getCurrentSettings();
                const settings = settingsRes.data.data || {};

                normalizedStore = normalizeStore(settings.store || {});
                normalizedTheme = normalizeTheme(settings.theme || {});
            } catch {
                const storeRes = await storeAPI.getCurrentStore();
                normalizedStore = normalizeStore(storeRes.data.data || {});

                if (normalizedStore.id) {
                    const themeRes = await storeAPI.getStoreTheme(normalizedStore.id);
                    normalizedTheme = normalizeTheme(themeRes.data.data || {});
                }
            }

            setSettings({ store: normalizedStore, theme: normalizedTheme });

            setStoreData({
                name: normalizedStore.name,
                slug: normalizedStore.slug,
                domain: normalizedStore.domain || '',
                description: normalizedStore.description,
                email: normalizedStore.email,
                phone: normalizedStore.phone,
                currency: normalizedStore.currency,
                language: normalizedStore.language,
                timezone: normalizedStore.timezone,
                taxRate: normalizedStore.taxRate,
                logoUrl: normalizedStore.logoUrl,
                faviconUrl: normalizedStore.faviconUrl,
                address: {
                    street: normalizedStore.address.street,
                    city: normalizedStore.address.city,
                    state: normalizedStore.address.state,
                    zipCode: normalizedStore.address.zipCode,
                    country: normalizedStore.address.country,
                },
                shippingConfig: cloneShippingConfig(normalizedStore.shippingConfig),
                seo: {
                    title: normalizedStore.seo.title,
                    description: normalizedStore.seo.description,
                    keywords: normalizedStore.seo.keywords,
                    ogImage: normalizedStore.seo.ogImage,
                },
                socialLinks: {
                    facebook: normalizedStore.socialLinks.facebook,
                    instagram: normalizedStore.socialLinks.instagram,
                    twitter: normalizedStore.socialLinks.twitter,
                    youtube: normalizedStore.socialLinks.youtube,
                    tiktok: normalizedStore.socialLinks.tiktok,
                    pinterest: normalizedStore.socialLinks.pinterest,
                },
                homepage: {
                    heroSlides: normalizedStore.homepage.heroSlides,
                },
                navigation: normalizedStore.navigation,
                footer: normalizedStore.footer,
            });

            setThemeData({
                primaryColor: normalizedTheme.primaryColor,
                secondaryColor: normalizedTheme.secondaryColor,
                accentColor: normalizedTheme.accentColor,
                backgroundColor: normalizedTheme.backgroundColor,
                textColor: normalizedTheme.textColor,
                fontFamily: normalizedTheme.fontFamily,
                borderRadius: normalizedTheme.borderRadius,
                buttonStyle: normalizedTheme.buttonStyle,
                headerStyle: normalizedTheme.headerStyle,
                footerLayout: normalizedTheme.footerLayout,
                layoutType: normalizedTheme.layoutType,
                productCardVariant: normalizedTheme.productCardVariant,
                productCardSize: normalizedTheme.productCardSize,
                productGridRows: normalizedTheme.productGridRows,
                productGridColumnsMobile: normalizedTheme.productGridColumnsMobile,
                productGridColumnsTablet: normalizedTheme.productGridColumnsTablet,
                productGridColumnsDesktop: normalizedTheme.productGridColumnsDesktop,
            });

            setHasChanges(false);
        } catch (error) {
            toast.error('Failed to load store settings');
            console.error('Load error:', error);
        } finally {
            if (showLoader) {
                setIsLoading(false);
            }
        }
    }, [setSettings]);

    // Load store data
    useEffect(() => {
        loadStoreData();
    }, [loadStoreData]);

    const handleStoreChange = (field, value) => {
        setStoreData(prev => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return { ...prev, [parent]: { ...prev[parent], [child]: value } };
            }
            return { ...prev, [field]: value };
        });
        setHasChanges(true);
    };

    const handleThemeChange = (field, value) => {
        setThemeData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const updateNavigationConfig = (updater) => {
        setStoreData((prev) => {
            const currentNavigation = prev.navigation || normalizeNavigation({}, DRAFT_NORMALIZE_OPTIONS);
            const nextNavigation = typeof updater === 'function' ? updater(currentNavigation) : updater;

            return {
                ...prev,
                navigation: normalizeNavigation(nextNavigation, DRAFT_NORMALIZE_OPTIONS),
            };
        });
        setHasChanges(true);
    };

    const updateFooterConfig = (updater) => {
        setStoreData((prev) => {
            const currentFooter = prev.footer || normalizeFooter({}, DRAFT_NORMALIZE_OPTIONS);
            const nextFooter = typeof updater === 'function' ? updater(currentFooter) : updater;

            return {
                ...prev,
                footer: normalizeFooter(nextFooter, DRAFT_NORMALIZE_OPTIONS),
            };
        });
        setHasChanges(true);
    };

    const createShippingOption = (overrides = {}) => ({
        id: `ship-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: 'New Shipping Option',
        description: '',
        baseRate: 0,
        enabled: true,
        estimatedDaysMin: 3,
        estimatedDaysMax: 5,
        freeShippingEligible: true,
        cityRates: [],
        ...overrides,
    });

    const createCityRate = () => ({
        id: `city-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        city: '',
        rate: 0,
    });

    const updateShippingConfig = (updater) => {
        setStoreData((prev) => {
            const currentConfig = prev.shippingConfig || cloneShippingConfig();
            const nextConfig = typeof updater === 'function' ? updater(currentConfig) : updater;
            return { ...prev, shippingConfig: nextConfig };
        });
        setHasChanges(true);
    };

    const updateShippingOption = (optionId, updater) => {
        updateShippingConfig((config) => ({
            ...config,
            options: (config.options || []).map((option) => (
                option.id === optionId
                    ? (typeof updater === 'function' ? updater(option) : updater)
                    : option
            )),
        }));
    };

    const addShippingOption = () => {
        updateShippingConfig((config) => {
            const options = [...(config.options || []), createShippingOption({
                label: `Shipping Option ${(config.options || []).length + 1}`,
            })];
            const defaultOptionId = config.defaultOptionId || options[0]?.id;
            return { ...config, options, defaultOptionId };
        });
    };

    const removeShippingOption = (optionId) => {
        if (editingShippingOptionId === optionId) {
            setEditingShippingOptionId('');
        }
        updateShippingConfig((config) => {
            const nextOptions = (config.options || []).filter((option) => option.id !== optionId);
            const nextDefault = config.defaultOptionId === optionId
                ? (nextOptions.find((option) => option.enabled)?.id || nextOptions[0]?.id || '')
                : config.defaultOptionId;
            return { ...config, options: nextOptions, defaultOptionId: nextDefault };
        });
    };

    const setDefaultShippingOption = (optionId) => {
        updateShippingConfig((config) => ({
            ...config,
            defaultOptionId: optionId,
        }));
    };

    const addCityRate = (optionId) => {
        updateShippingOption(optionId, (option) => ({
            ...option,
            cityRates: [...(option.cityRates || []), createCityRate()],
        }));
    };

    const updateCityRate = (optionId, rateId, field, value) => {
        updateShippingOption(optionId, (option) => ({
            ...option,
            cityRates: (option.cityRates || []).map((rate) => (
                rate.id === rateId ? { ...rate, [field]: value } : rate
            )),
        }));
    };

    const removeCityRate = (optionId, rateId) => {
        updateShippingOption(optionId, (option) => ({
            ...option,
            cityRates: (option.cityRates || []).filter((rate) => rate.id !== rateId),
        }));
    };

    const applyThemePreset = (presetName) => {
        const preset = THEME_PRESETS[presetName];
        if (preset) {
            setThemeData(prev => ({ ...prev, ...preset }));
            setHasChanges(true);
            toast.success(`Applied "${presetName}" theme preset`);
        }
    };

    const createHeroSlide = () => normalizeHomepageHeroSlide({
        ...DEFAULT_HERO_SLIDE,
        id: `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: '',
        badge: storeData.name ? `Featured at ${storeData.name}` : '',
    }, 0, DRAFT_NORMALIZE_OPTIONS);

    const createNavigationLinkItem = (type = 'link') => normalizeNavigationLink({
        id: `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: type === 'categories' ? 'Categories' : type === 'dropdown' ? 'New Menu' : 'New Link',
        to: type === 'dropdown' ? '' : '/products',
        type,
        badge: '',
        newTab: false,
        isVisible: true,
    }, 0, DRAFT_NORMALIZE_OPTIONS);

    const createNavigationChildItem = () => normalizeNavigationChildLink({
        id: `nav-child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: 'Sub Link',
        to: '/products',
        newTab: false,
        isVisible: true,
    }, 0, DRAFT_NORMALIZE_OPTIONS);

    const createFooterLinkItem = (label = 'New Link') => normalizeFooterLink({
        id: `footer-link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        to: '/products',
        newTab: false,
        isVisible: true,
    }, 0, DRAFT_NORMALIZE_OPTIONS);

    const createFooterLinkGroupItem = () => normalizeFooterLinkGroup({
        id: `footer-group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: 'New Group',
        links: [createFooterLinkItem('Group Link')],
    }, 0, DRAFT_NORMALIZE_OPTIONS);

    const updateHeroSlides = (updater) => {
        setStoreData((prev) => {
            const currentSlides = prev.homepage?.heroSlides || [];
            const nextSlides = typeof updater === 'function' ? updater(currentSlides) : updater;

            return {
                ...prev,
                homepage: {
                    ...prev.homepage,
                    heroSlides: nextSlides,
                },
            };
        });
        setHasChanges(true);
    };

    const handleHeroSlideChange = (slideId, field, value) => {
        updateHeroSlides((slides) => slides.map((slide, index) => (
            slide.id === slideId
                ? normalizeHomepageHeroSlide({ ...slide, [field]: value }, index, DRAFT_NORMALIZE_OPTIONS)
                : slide
        )));
    };

    const addHeroSlide = () => {
        updateHeroSlides((slides) => [...slides, createHeroSlide()]);
    };

    const removeHeroSlide = (slideId) => {
        if (editingHeroSlideId === slideId) {
            setEditingHeroSlideId('');
        }
        updateHeroSlides((slides) => slides.filter((slide) => slide.id !== slideId));
    };

    const moveHeroSlide = (slideId, direction) => {
        updateHeroSlides((slides) => {
            const currentIndex = slides.findIndex((slide) => slide.id === slideId);
            const targetIndex = currentIndex + direction;

            if (currentIndex < 0 || targetIndex < 0 || targetIndex >= slides.length) {
                return slides;
            }

            const nextSlides = [...slides];
            const [movedSlide] = nextSlides.splice(currentIndex, 1);
            nextSlides.splice(targetIndex, 0, movedSlide);
            return nextSlides.map((slide, index) => normalizeHomepageHeroSlide(slide, index, DRAFT_NORMALIZE_OPTIONS));
        });
    };

    const handleHeroSlideImageUpload = async (slideId, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingSlideId(slideId);
        try {
            const response = await uploadAPI.uploadImage(file, 'hero-slides');
            const imageUrl = response?.data?.data?.url;

            if (!imageUrl) {
                toast.error('Image upload failed');
                return;
            }

            handleHeroSlideChange(slideId, 'image', imageUrl);
            toast.success('Hero image uploaded');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to upload hero image');
        } finally {
            setUploadingSlideId('');
            event.target.value = '';
        }
    };

    const updateNavigationLinks = (updater) => {
        updateNavigationConfig((navigation) => ({
            ...navigation,
            links: typeof updater === 'function' ? updater(navigation.links || []) : updater,
        }));
    };

    const addNavigationLink = (type = 'link') => {
        updateNavigationLinks((links) => [...links, createNavigationLinkItem(type)]);
    };

    const updateNavigationLinkField = (linkId, field, value) => {
        updateNavigationLinks((links) => links.map((link, index) => (
            link.id === linkId
                ? normalizeNavigationLink({ ...link, [field]: value }, index, DRAFT_NORMALIZE_OPTIONS)
                : link
        )));
    };

    const removeNavigationLink = (linkId) => {
        if (editingNavLinkId === linkId) {
            setEditingNavLinkId('');
        }
        updateNavigationLinks((links) => links.filter((link) => link.id !== linkId));
    };

    const moveNavigationLink = (linkId, direction) => {
        updateNavigationLinks((links) => {
            const currentIndex = links.findIndex((link) => link.id === linkId);
            const targetIndex = currentIndex + direction;

            if (currentIndex < 0 || targetIndex < 0 || targetIndex >= links.length) {
                return links;
            }

            const nextLinks = [...links];
            const [movedLink] = nextLinks.splice(currentIndex, 1);
            nextLinks.splice(targetIndex, 0, movedLink);
            return nextLinks.map((link, index) => normalizeNavigationLink(link, index, DRAFT_NORMALIZE_OPTIONS));
        });
    };

    const updateNavigationChildLinks = (linkId, updater) => {
        updateNavigationLinks((links) => links.map((link, index) => {
            if (link.id !== linkId) {
                return link;
            }

            const nextChildren = typeof updater === 'function' ? updater(link.children || []) : updater;
            return normalizeNavigationLink({
                ...link,
                children: nextChildren,
            }, index, DRAFT_NORMALIZE_OPTIONS);
        }));
    };

    const addNavigationChildLink = (linkId) => {
        updateNavigationChildLinks(linkId, (children) => [...children, createNavigationChildItem()]);
    };

    const updateNavigationChildLinkField = (linkId, childId, field, value) => {
        updateNavigationChildLinks(linkId, (children) => children.map((child, index) => (
            child.id === childId
                ? normalizeNavigationChildLink({ ...child, [field]: value }, index, DRAFT_NORMALIZE_OPTIONS)
                : child
        )));
    };

    const removeNavigationChildLink = (linkId, childId) => {
        updateNavigationChildLinks(linkId, (children) => children.filter((child) => child.id !== childId));
    };

    const moveNavigationChildLink = (linkId, childId, direction) => {
        updateNavigationChildLinks(linkId, (children) => {
            const currentIndex = children.findIndex((child) => child.id === childId);
            const targetIndex = currentIndex + direction;

            if (currentIndex < 0 || targetIndex < 0 || targetIndex >= children.length) {
                return children;
            }

            const nextChildren = [...children];
            const [movedChild] = nextChildren.splice(currentIndex, 1);
            nextChildren.splice(targetIndex, 0, movedChild);
            return nextChildren.map((child, index) => normalizeNavigationChildLink(child, index, DRAFT_NORMALIZE_OPTIONS));
        });
    };

    const updateFooterLegalLinks = (updater) => {
        updateFooterConfig((footer) => ({
            ...footer,
            legalLinks: typeof updater === 'function' ? updater(footer.legalLinks || []) : updater,
        }));
    };

    const addFooterLegalLink = () => {
        updateFooterLegalLinks((links) => [...links, createFooterLinkItem('Legal Link')]);
    };

    const updateFooterLegalLinkField = (linkId, field, value) => {
        updateFooterLegalLinks((links) => links.map((link, index) => (
            link.id === linkId
                ? normalizeFooterLink({ ...link, [field]: value }, index, DRAFT_NORMALIZE_OPTIONS)
                : link
        )));
    };

    const removeFooterLegalLink = (linkId) => {
        if (editingFooterLegalId === linkId) {
            setEditingFooterLegalId('');
        }
        updateFooterLegalLinks((links) => links.filter((link) => link.id !== linkId));
    };

    const updateFooterGroups = (updater) => {
        updateFooterConfig((footer) => ({
            ...footer,
            linkGroups: typeof updater === 'function' ? updater(footer.linkGroups || []) : updater,
        }));
    };

    const addFooterGroup = () => {
        updateFooterGroups((groups) => [...groups, createFooterLinkGroupItem()]);
    };

    const updateFooterGroupField = (groupId, field, value) => {
        updateFooterGroups((groups) => groups.map((group, index) => (
            group.id === groupId
                ? normalizeFooterLinkGroup({ ...group, [field]: value }, index, DRAFT_NORMALIZE_OPTIONS)
                : group
        )));
    };

    const removeFooterGroup = (groupId) => {
        if (editingFooterGroupId === groupId) {
            setEditingFooterGroupId('');
        }
        updateFooterGroups((groups) => groups.filter((group) => group.id !== groupId));
    };

    const moveFooterGroup = (groupId, direction) => {
        updateFooterGroups((groups) => {
            const currentIndex = groups.findIndex((group) => group.id === groupId);
            const targetIndex = currentIndex + direction;

            if (currentIndex < 0 || targetIndex < 0 || targetIndex >= groups.length) {
                return groups;
            }

            const nextGroups = [...groups];
            const [movedGroup] = nextGroups.splice(currentIndex, 1);
            nextGroups.splice(targetIndex, 0, movedGroup);
            return nextGroups.map((group, index) => normalizeFooterLinkGroup(group, index, DRAFT_NORMALIZE_OPTIONS));
        });
    };

    const updateFooterGroupLinks = (groupId, updater) => {
        updateFooterGroups((groups) => groups.map((group, index) => {
            if (group.id !== groupId) {
                return group;
            }

            const nextLinks = typeof updater === 'function' ? updater(group.links || []) : updater;
            return normalizeFooterLinkGroup({
                ...group,
                links: nextLinks,
            }, index, DRAFT_NORMALIZE_OPTIONS);
        }));
    };

    const addFooterGroupLink = (groupId) => {
        updateFooterGroupLinks(groupId, (links) => [...links, createFooterLinkItem('Group Link')]);
    };

    const updateFooterGroupLinkField = (groupId, linkId, field, value) => {
        updateFooterGroupLinks(groupId, (links) => links.map((link, index) => (
            link.id === linkId
                ? normalizeFooterLink({ ...link, [field]: value }, index, DRAFT_NORMALIZE_OPTIONS)
                : link
        )));
    };

    const removeFooterGroupLink = (groupId, linkId) => {
        updateFooterGroupLinks(groupId, (links) => links.filter((link) => link.id !== linkId));
    };


    const startNavigationDraft = (type = 'link') => {
        setNavDraft(createNavigationLinkItem(type));
    };

    const updateNavigationDraftField = (field, value) => {
        setNavDraft((current) => current
            ? normalizeNavigationLink({ ...current, [field]: value }, 0, DRAFT_NORMALIZE_OPTIONS)
            : current);
    };

    const commitNavigationDraft = () => {
        if (!navDraft) return;
        const fallbackLabel = navDraft.type === 'categories'
            ? 'Categories'
            : navDraft.type === 'dropdown'
                ? 'New Menu'
                : 'New Link';
        const normalizedDraft = normalizeNavigationLink({
            ...navDraft,
            label: navDraft.label?.trim() || fallbackLabel,
        }, 0, DRAFT_NORMALIZE_OPTIONS);
        updateNavigationLinks((links) => [
            ...links,
            normalizeNavigationLink(normalizedDraft, links.length, DRAFT_NORMALIZE_OPTIONS),
        ]);
        setEditingNavLinkId(normalizedDraft.id);
        setNavDraft(null);
        toast.success('Navbar link added');
    };

    const cancelNavigationDraft = () => {
        setNavDraft(null);
    };

    const startFooterGroupDraft = () => {
        setFooterGroupDraft(createFooterLinkGroupItem());
    };

    const updateFooterGroupDraftField = (field, value) => {
        setFooterGroupDraft((current) => current
            ? normalizeFooterLinkGroup({ ...current, [field]: value }, 0, DRAFT_NORMALIZE_OPTIONS)
            : current);
    };

    const updateFooterGroupDraftLinkField = (field, value) => {
        setFooterGroupDraft((current) => {
            if (!current) return current;
            const currentLinks = current.links || [];
            const baseLink = currentLinks[0] || createFooterLinkItem('Group Link');
            const updatedLink = normalizeFooterLink({ ...baseLink, [field]: value }, 0, DRAFT_NORMALIZE_OPTIONS);
            const nextLinks = [updatedLink, ...currentLinks.slice(1)];
            return normalizeFooterLinkGroup({ ...current, links: nextLinks }, 0, DRAFT_NORMALIZE_OPTIONS);
        });
    };

    const commitFooterGroupDraft = () => {
        if (!footerGroupDraft) return;
        const normalizedDraft = normalizeFooterLinkGroup({
            ...footerGroupDraft,
            title: footerGroupDraft.title?.trim() || 'New Group',
            links: (footerGroupDraft.links || []).length
                ? footerGroupDraft.links
                : [createFooterLinkItem('Group Link')],
        }, 0, DRAFT_NORMALIZE_OPTIONS);
        updateFooterGroups((groups) => [
            ...groups,
            normalizeFooterLinkGroup(normalizedDraft, groups.length, DRAFT_NORMALIZE_OPTIONS),
        ]);
        setEditingFooterGroupId(normalizedDraft.id);
        setFooterGroupDraft(null);
        toast.success('Footer group added');
    };

    const cancelFooterGroupDraft = () => {
        setFooterGroupDraft(null);
    };

    const startFooterLegalDraft = () => {
        setFooterLegalDraft(createFooterLinkItem('Legal Link'));
    };

    const updateFooterLegalDraftField = (field, value) => {
        setFooterLegalDraft((current) => current
            ? normalizeFooterLink({ ...current, [field]: value }, 0, DRAFT_NORMALIZE_OPTIONS)
            : current);
    };

    const commitFooterLegalDraft = () => {
        if (!footerLegalDraft) return;
        const normalizedDraft = normalizeFooterLink({
            ...footerLegalDraft,
            label: footerLegalDraft.label?.trim() || 'Legal Link',
        }, 0, DRAFT_NORMALIZE_OPTIONS);
        updateFooterLegalLinks((links) => [
            ...links,
            normalizeFooterLink(normalizedDraft, links.length, DRAFT_NORMALIZE_OPTIONS),
        ]);
        setEditingFooterLegalId(normalizedDraft.id);
        setFooterLegalDraft(null);
        toast.success('Legal link added');
    };

    const cancelFooterLegalDraft = () => {
        setFooterLegalDraft(null);
    };

    const startHeroSlideDraft = () => {
        setHeroSlideDraft(createHeroSlide());
    };

    const updateHeroSlideDraftField = (field, value) => {
        setHeroSlideDraft((current) => current
            ? normalizeHomepageHeroSlide({ ...current, [field]: value }, 0, DRAFT_NORMALIZE_OPTIONS)
            : current);
    };

    const commitHeroSlideDraft = () => {
        if (!heroSlideDraft) return;
        const normalizedDraft = normalizeHomepageHeroSlide(heroSlideDraft, 0, DRAFT_NORMALIZE_OPTIONS);
        updateHeroSlides((slides) => [
            ...slides,
            normalizeHomepageHeroSlide(normalizedDraft, slides.length, DRAFT_NORMALIZE_OPTIONS),
        ]);
        setEditingHeroSlideId(normalizedDraft.id);
        setHeroSlideDraft(null);
        toast.success('Hero slide added');
    };

    const cancelHeroSlideDraft = () => {
        setHeroSlideDraft(null);
    };

    const startShippingOptionDraft = () => {
        const nextLabel = `Shipping Option ${(storeData.shippingConfig.options || []).length + 1}`;
        setShippingOptionDraft(createShippingOption({ label: nextLabel }));
    };

    const updateShippingOptionDraft = (field, value) => {
        setShippingOptionDraft((current) => current ? { ...current, [field]: value } : current);
    };

    const commitShippingOptionDraft = () => {
        if (!shippingOptionDraft) return;
        updateShippingConfig((config) => {
            const nextOptions = [...(config.options || []), shippingOptionDraft];
            return {
                ...config,
                options: nextOptions,
                defaultOptionId: config.defaultOptionId || shippingOptionDraft.id,
            };
        });
        setEditingShippingOptionId(shippingOptionDraft.id);
        setShippingOptionDraft(null);
        toast.success('Shipping option added');
    };

    const cancelShippingOptionDraft = () => {
        setShippingOptionDraft(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const normalizedShippingConfig = {
                ...storeData.shippingConfig,
                options: (storeData.shippingConfig.options || []).map((option, index) => ({
                    ...option,
                    label: option.label?.trim() || `Shipping Option ${index + 1}`,
                    cityRates: (option.cityRates || [])
                        .filter((rate) => String(rate.city || '').trim())
                        .map((rate) => ({
                            ...rate,
                            city: String(rate.city || '').trim(),
                            rate: Number.parseFloat(rate.rate) || 0,
                        })),
                })),
                defaultOptionId: storeData.shippingConfig.defaultOptionId
                    || storeData.shippingConfig.options?.[0]?.id
                    || '',
            };

            const storePayload = {
                name: storeData.name,
                slug: storeData.slug,
                domain: storeData.domain || null,
                description: storeData.description,
                email: storeData.email,
                phone: storeData.phone,
                currency: storeData.currency,
                language: storeData.language,
                timezone: storeData.timezone,
                taxRate: parseFloat(storeData.taxRate) || 0,
                logoUrl: storeData.logoUrl,
                faviconUrl: storeData.faviconUrl,
                address: storeData.address,
                shippingConfig: normalizedShippingConfig,
                seo: storeData.seo,
                socialLinks: storeData.socialLinks,
                homepage: {
                    heroSlides: (storeData.homepage?.heroSlides || [])
                        .map((slide, index) => normalizeHomepageHeroSlide(slide, index))
                        .filter((slide) => slide.title),
                },
                navigation: normalizeNavigation(storeData.navigation || {}),
                footer: normalizeFooter(storeData.footer || {}),
            };
            const themePayload = {
                ...themeData,
            };

            await storeAPI.updateCurrentSettings({
                store: storePayload,
                theme: themePayload,
            });

            await loadStoreData({ showLoader: false });

            setHasChanges(false);
            toast.success('Store settings saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save settings');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Store, description: 'Store name, contact & basic info' },
        { id: 'branding', label: 'Branding', icon: Image, description: 'Logo, favicon & visual identity' },
        { id: 'theme', label: 'Theme', icon: Palette, description: 'Colors, fonts & layout' },
        { id: 'navigation', label: 'Navigation', icon: Globe, description: 'Navbar and footer links' },
        { id: 'homepage', label: 'Homepage', icon: Image, description: 'Manage homepage hero slides' },
        { id: 'shipping', label: 'Shipping', icon: Truck, description: 'Shipping rates & options' },
        { id: 'tax', label: 'Tax & Currency', icon: DollarSign, description: 'Tax rate, currency & locale' },
        { id: 'seo', label: 'SEO', icon: Search, description: 'Search engine optimization' },
        { id: 'social', label: 'Social Links', icon: Share2, description: 'Social media profiles' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading store settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                            Store Settings
                        </h1>
                        <p className="text-slate-500 mt-1">Customize your store's appearance, settings, and configuration</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasChanges && (
                            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Unsaved changes
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={loadStoreData}
                            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Tab Navigation */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1 sticky top-24">
                        {tabs.map((tab) => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                                        : 'text-slate-600 hover:bg-white hover:shadow-sm'
                                    }`}
                            >
                                <tab.icon className={`h-5 w-5 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-violet-500'
                                    }`} />
                                <div>
                                    <p className="font-medium text-sm">{tab.label}</p>
                                    <p className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-violet-200' : 'text-slate-400'
                                        }`}>{tab.description}</p>
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <div
                            key={activeTab}
                        >
                            {activeTab === 'general' && renderGeneralTab()}
                            {activeTab === 'branding' && renderBrandingTab()}
                            {activeTab === 'theme' && renderThemeTab()}
                            {activeTab === 'navigation' && renderNavigationTab()}
                            {activeTab === 'homepage' && renderHomepageTab()}
                            {activeTab === 'shipping' && renderShippingTab()}
                            {activeTab === 'tax' && renderTaxTab()}
                            {activeTab === 'seo' && renderSeoTab()}
                            {activeTab === 'social' && renderSocialTab()}
                        </div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    // ââ Tab Renderers âââââââââââââââââââââââââââââââââââââââ

    function renderGeneralTab() {
        return (
            <div className="space-y-6">
                <SettingsCard title="Store Information" description="Basic information about your store">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Store Name" value={storeData.name} onChange={(v) => handleStoreChange('name', v)} placeholder="My Awesome Store" icon={<Store className="h-4 w-4" />} />
                        <InputField label="Store URL Slug" value={storeData.slug} onChange={(v) => handleStoreChange('slug', v)} placeholder="my-store" icon={<Globe className="h-4 w-4" />} />
                        <InputField label="Store Domain" value={storeData.domain} onChange={(v) => handleStoreChange('domain', v)} placeholder="store.example.com or localhost" icon={<Globe className="h-4 w-4" />} />
                        <InputField label="Contact Email" value={storeData.email} onChange={(v) => handleStoreChange('email', v)} placeholder="contact@store.com" icon={<Mail className="h-4 w-4" />} type="email" />
                        <InputField label="Contact Phone" value={storeData.phone} onChange={(v) => handleStoreChange('phone', v)} placeholder="+1 234 567 8900" icon={<Phone className="h-4 w-4" />} />
                        <InputField label="Timezone" value={storeData.timezone} onChange={(v) => handleStoreChange('timezone', v)} placeholder="Asia/Dhaka" icon={<Clock className="h-4 w-4" />} />
                    </div>
                    <div className="mt-5">
                        <TextareaField
                            label="Store Description"
                            value={storeData.description}
                            onChange={(value) => handleStoreChange('description', value)}
                            placeholder="Describe your store..."
                            rows={3}
                        />
                    </div>
                </SettingsCard>

                <SettingsCard title="Store Address" description="Physical address of your business">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <InputField label="Street Address" value={storeData.address.street} onChange={(v) => handleStoreChange('address.street', v)} placeholder="123 Commerce Street" icon={<MapPin className="h-4 w-4" />} />
                        </div>
                        <InputField label="City" value={storeData.address.city} onChange={(v) => handleStoreChange('address.city', v)} placeholder="New York" />
                        <InputField label="State/Province" value={storeData.address.state} onChange={(v) => handleStoreChange('address.state', v)} placeholder="NY" />
                        <InputField label="ZIP/Postal Code" value={storeData.address.zipCode} onChange={(v) => handleStoreChange('address.zipCode', v)} placeholder="10001" />
                        <InputField label="Country" value={storeData.address.country} onChange={(v) => handleStoreChange('address.country', v)} placeholder="United States" />
                    </div>
                </SettingsCard>
            </div>
        );
    }

    function renderBrandingTab() {
        return (
            <div className="space-y-6">
                <SettingsCard title="Logo & Favicon" description="Upload your store's visual branding">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Store Logo</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-400 transition-colors">
                                {storeData.logoUrl ? (
                                    <div className="space-y-3">
                                        <img src={storeData.logoUrl} alt="Logo" className="h-20 mx-auto object-contain rounded-lg" />
                                        <button type="button" onClick={() => handleStoreChange('logoUrl', '')} className="text-sm text-rose-600 hover:text-rose-700">Remove</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                                        <p className="text-sm text-slate-500">Enter logo URL below</p>
                                    </div>
                                )}
                            </div>
                            <InputField label="Logo URL" value={storeData.logoUrl} onChange={(v) => handleStoreChange('logoUrl', v)} placeholder="https://..." className="mt-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Favicon</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-400 transition-colors">
                                {storeData.faviconUrl ? (
                                    <div className="space-y-3">
                                        <img src={storeData.faviconUrl} alt="Favicon" className="h-12 mx-auto object-contain" />
                                        <button type="button" onClick={() => handleStoreChange('faviconUrl', '')} className="text-sm text-rose-600 hover:text-rose-700">Remove</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Image className="h-8 w-8 text-slate-400 mx-auto" />
                                        <p className="text-sm text-slate-500">Enter favicon URL below</p>
                                    </div>
                                )}
                            </div>
                            <InputField label="Favicon URL" value={storeData.faviconUrl} onChange={(v) => handleStoreChange('faviconUrl', v)} placeholder="https://..." className="mt-3" />
                        </div>
                    </div>
                </SettingsCard>
            </div>
        );
    }

    function renderThemeTab() {
        const previewGridConfig = getNormalizedProductGridConfig(themeData);
        const previewGridClassName = getProductGridClassName(themeData);
        const previewLayout = resolveProductLayout(themeData.layoutType);
        const previewCardVariant = resolveProductCardVariant(themeData.productCardVariant);
        const PreviewCardComponent = PRODUCT_CARD_COMPONENTS[previewCardVariant] || PRODUCT_CARD_COMPONENTS.editorial;
        const previewProductCount = previewLayout === 'list' ? 4 : Math.max(previewGridConfig.desktopColumns, 6);
        const previewProducts = FEATURED_PREVIEW_PRODUCTS.slice(0, previewProductCount);
        const previewThemeStyles = getPreviewThemeStyles(themeData);
        const previewCards = (() => {
            if (previewLayout === 'list') {
                return (
                    <div className="space-y-4">
                        {previewProducts.map((product) => (
                            <ProductListCard key={product.id} product={product} theme={themeData} />
                        ))}
                    </div>
                );
            }

            if (previewLayout === 'masonry') {
                return (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 lg:gap-6">
                        {previewProducts.map((product) => (
                            <div key={product.id} className="mb-4 break-inside-avoid lg:mb-6">
                                <PreviewCardComponent product={product} theme={themeData} className="h-full" />
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <div className={`grid ${previewGridClassName}`}>
                    {previewProducts.map((product) => (
                        <div key={product.id} className="w-full min-w-0">
                            <PreviewCardComponent product={product} theme={themeData} className="h-full" />
                        </div>
                    ))}
                </div>
            );
        })();

        return (
            <div className="space-y-6">
                {/* Temporary deseble this 2 option , don't call them back */}


                {/* <SettingsCard title="Theme Presets" description="Choose a preset theme or customize your own">
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(THEME_PRESETS).map(([name, preset]) => (
                            <button
                                type="button"
                                key={name}
                                onClick={() => applyThemePreset(name)}
                                className="p-4 border border-slate-200 rounded-xl hover:border-violet-400 hover:shadow-md transition-all group text-left"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-6 w-6 rounded-full" style={{ background: preset.primaryColor }}></div>
                                    <div className="h-6 w-6 rounded-full" style={{ background: preset.accentColor }}></div>
                                    <div className="h-6 w-6 rounded-full border" style={{ background: preset.backgroundColor }}></div>
                                </div>
                                <p className="font-medium text-sm text-slate-900 capitalize">{name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{preset.fontFamily.split(',')[0]}</p>
                            </button>
                        ))}
                    </div>
                </SettingsCard>

                <SettingsCard title="Colors" description="Customize your store's color palette">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        <ColorPicker label="Primary Color" value={themeData.primaryColor} onChange={(v) => handleThemeChange('primaryColor', v)} />
                        <ColorPicker label="Secondary Color" value={themeData.secondaryColor} onChange={(v) => handleThemeChange('secondaryColor', v)} />
                        <ColorPicker label="Accent Color" value={themeData.accentColor} onChange={(v) => handleThemeChange('accentColor', v)} />
                        <ColorPicker label="Background" value={themeData.backgroundColor} onChange={(v) => handleThemeChange('backgroundColor', v)} />
                        <ColorPicker label="Text Color" value={themeData.textColor} onChange={(v) => handleThemeChange('textColor', v)} />
                    </div>
                </SettingsCard> */}

                <SettingsCard title="Product Card Designs" description="Choose which product card style the storefront uses">
                    <ProductCardVariantSelector
                        value={themeData.productCardVariant}
                        onChange={(value) => handleThemeChange('productCardVariant', value)}
                        primaryColor={themeData.primaryColor}
                        accentColor={themeData.accentColor}
                    />
                </SettingsCard>

                <SettingsCard title="Typography & Layout" description="Font family, border radius, and layout style">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SelectField label="Font Family" value={themeData.fontFamily} onChange={(v) => handleThemeChange('fontFamily', v)} options={THEME_FONT_OPTIONS} />
                        <SelectField label="Button Style" value={themeData.buttonStyle} onChange={(v) => handleThemeChange('buttonStyle', v)} options={BUTTON_STYLE_OPTIONS} />
                        <SelectField label="Header Style" value={themeData.headerStyle} onChange={(v) => handleThemeChange('headerStyle', v)} options={HEADER_STYLE_OPTIONS} />
                        <SelectField label="Footer Layout" value={themeData.footerLayout} onChange={(v) => handleThemeChange('footerLayout', v)} options={FOOTER_LAYOUT_OPTIONS} />
                        <SelectField label="Product Layout" value={themeData.layoutType} onChange={(v) => handleThemeChange('layoutType', v)} options={PRODUCT_LAYOUT_OPTIONS} />
                        <SelectField label="Product Card Size" value={themeData.productCardSize} onChange={(v) => handleThemeChange('productCardSize', v)} options={PRODUCT_CARD_SIZE_OPTIONS} />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Border Radius: {themeData.borderRadius}px</label>
                            <input
                                type="range"
                                min="0"
                                max="24"
                                value={themeData.borderRadius}
                                onChange={(e) => handleThemeChange('borderRadius', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Sharp</span>
                                <span>Rounded</span>
                            </div>
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Product Grid Controls" description="Control default rows and responsive card columns for public product pages">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <InputField
                            label="Rows Per Page"
                            value={themeData.productGridRows}
                            onChange={(value) => handleThemeChange('productGridRows', Math.max(1, Math.min(6, parseInt(value, 10) || 1)))}
                            type="number"
                        />
                        <InputField
                            label="Mobile Columns"
                            value={themeData.productGridColumnsMobile}
                            onChange={(value) => handleThemeChange('productGridColumnsMobile', Math.max(1, Math.min(2, parseInt(value, 10) || 1)))}
                            type="number"
                        />
                        <InputField
                            label="Tablet Columns"
                            value={themeData.productGridColumnsTablet}
                            onChange={(value) => handleThemeChange('productGridColumnsTablet', Math.max(1, Math.min(6, parseInt(value, 10) || 1)))}
                            type="number"
                        />
                        <InputField
                            label="Desktop Columns"
                            value={themeData.productGridColumnsDesktop}
                            onChange={(value) => handleThemeChange('productGridColumnsDesktop', Math.max(1, Math.min(10, parseInt(value, 10) || 1)))}
                            type="number"
                        />
                    </div>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        Default page size: <span className="font-semibold text-slate-900">{getProductGridPageSize(themeData, themeData.layoutType)}</span> products.
                        Mobile stays responsive because the storefront uses separate mobile, tablet, and desktop column settings.
                    </div>
                </SettingsCard>

                {/* Live Preview */}
                <SettingsCard title="Live Preview" description="See how the storefront product grid responds to your current settings">
                    <div className="border border-slate-200 rounded-xl overflow-hidden" style={previewThemeStyles}>
                        <div className="p-4" style={{ backgroundColor: themeData.primaryColor }}>
                            <h3 className="text-white font-bold text-lg">{storeData.name || 'Your Store'}</h3>
                        </div>
                        <div className="p-6" style={{ backgroundColor: themeData.backgroundColor, color: themeData.textColor }}>
                            <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg">Featured products preview</h4>
                                    <p className="text-sm opacity-70">Uses the same responsive grid rules as the storefront product sections.</p>
                                </div>
                                <div className="text-sm opacity-75">
                                    {previewGridConfig.mobileColumns} / {previewGridConfig.tabletColumns} / {previewGridConfig.desktopColumns} columns
                                </div>
                            </div>
                            <div
                                onClickCapture={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                            >
                                {previewCards}
                            </div>
                        </div>
                        <div className="p-3 text-center text-sm" style={{ backgroundColor: themeData.accentColor, color: '#fff' }}>
                            Special Offer: Free Shipping on orders over ${storeData.shippingConfig.freeShippingThreshold}!
                        </div>
                    </div>
                </SettingsCard>
            </div>
        );
    }



    function renderNavigationTab() {
        const navigationLinks = storeData.navigation?.links || [];
        const footerGroups = storeData.footer?.linkGroups || [];
        const footerLegalLinks = storeData.footer?.legalLinks || [];

        const getNavigationSummary = (link) => {
            const parts = [];
            if (link.type === 'categories') {
                parts.push('Categories mega menu');
            } else if (link.type === 'dropdown') {
                parts.push('Dropdown menu');
            } else {
                parts.push('Standard link');
            }

            if (link.to) {
                parts.push('URL: ' + link.to);
            } else if (link.type !== 'dropdown') {
                parts.push('No URL');
            }

            parts.push(link.isVisible ? 'Visible' : 'Hidden');

            if (link.newTab) {
                parts.push('Opens in new tab');
            }

            const childCount = link.children?.length || 0;
            if (childCount) {
                parts.push(childCount + ' dropdown item' + (childCount === 1 ? '' : 's'));
            }

            return parts.join('  ');
        };

        return (
            <div className="space-y-6">
                <SettingsCard title="Navbar Controls" description="Configure header actions, CTA, and the main navigation links">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleField
                            label="Show Search"
                            description="Keep product search visible in the navbar"
                            value={storeData.navigation?.showSearch}
                            onChange={(value) => updateNavigationConfig((navigation) => ({ ...navigation, showSearch: value }))}
                        />
                        <ToggleField
                            label="Show Wishlist"
                            description="Display the wishlist shortcut in the navbar"
                            value={storeData.navigation?.showWishlist}
                            onChange={(value) => updateNavigationConfig((navigation) => ({ ...navigation, showWishlist: value }))}
                        />
                        <ToggleField
                            label="Show Cart"
                            description="Display the cart drawer trigger in the navbar"
                            value={storeData.navigation?.showCart}
                            onChange={(value) => updateNavigationConfig((navigation) => ({ ...navigation, showCart: value }))}
                        />
                        <ToggleField
                            label="Show Auth Buttons"
                            description="Show sign-in and account actions when relevant"
                            value={storeData.navigation?.showAuthButtons}
                            onChange={(value) => updateNavigationConfig((navigation) => ({ ...navigation, showAuthButtons: value }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                        <InputField
                            label="Header CTA Label"
                            value={storeData.navigation?.ctaLabel || ''}
                            onChange={(value) => updateNavigationConfig((navigation) => ({ ...navigation, ctaLabel: value }))}
                            placeholder="Shop New In"
                        />
                        <InputField
                            label="Header CTA Link"
                            value={storeData.navigation?.ctaLink || ''}
                            onChange={(value) => updateNavigationConfig((navigation) => ({ ...navigation, ctaLink: value }))}
                            placeholder="/products"
                        />
                    </div>
                </SettingsCard>

                <SettingsCard title="Navbar Links" description="Add, remove, and reorder the public navigation links">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <p className="text-sm text-slate-500">Use "Dropdown Menu" for custom sub-links or "Categories" when you want the category mega menu to remain active.</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => startNavigationDraft('link')}
                                disabled={Boolean(navDraft)}
                                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Add Link
                            </button>
                            <button
                                type="button"
                                onClick={() => startNavigationDraft('dropdown')}
                                disabled={Boolean(navDraft)}
                                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Add Dropdown
                            </button>
                            <button
                                type="button"
                                onClick={() => startNavigationDraft('categories')}
                                disabled={Boolean(navDraft)}
                                className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Add Categories
                            </button>
                        </div>
                    </div>

                    {navDraft && (
                        <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">New Navbar Link</p>
                                    <p className="text-xs text-slate-500">Fill in the details and add it to the list.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={cancelNavigationDraft}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                <InputField
                                    label="Label"
                                    value={navDraft.label}
                                    onChange={(value) => updateNavigationDraftField('label', value)}
                                    placeholder="Products"
                                />
                                <SelectField
                                    label="Type"
                                    value={navDraft.type}
                                    onChange={(value) => updateNavigationDraftField('type', value)}
                                    options={[
                                        { value: 'link', label: 'Standard Link' },
                                        { value: 'dropdown', label: 'Dropdown Menu' },
                                        { value: 'categories', label: 'Categories Mega Menu' },
                                    ]}
                                />
                                <InputField
                                    label="URL"
                                    value={navDraft.to}
                                    onChange={(value) => updateNavigationDraftField('to', value)}
                                    placeholder={navDraft.type === 'categories' ? '/products' : navDraft.type === 'dropdown' ? '(optional)' : '/about'}
                                />
                                <InputField
                                    label="Badge"
                                    value={navDraft.badge || ''}
                                    onChange={(value) => updateNavigationDraftField('badge', value)}
                                    placeholder="New"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <ToggleField
                                    label="Visible"
                                    description="Hide the link without deleting it"
                                    value={navDraft.isVisible}
                                    onChange={(value) => updateNavigationDraftField('isVisible', value)}
                                />
                                <ToggleField
                                    label="Open in New Tab"
                                    description="Useful for external destinations"
                                    value={navDraft.newTab}
                                    onChange={(value) => updateNavigationDraftField('newTab', value)}
                                />
                            </div>

                            {navDraft.type !== 'categories' && (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs text-slate-500">
                                    Dropdown items can be added after you save this link.
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={commitNavigationDraft}
                                    className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
                                >
                                    Add Link
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelNavigationDraft}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {navigationLinks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                            No navbar links yet. Use the buttons above to create your first link.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {navigationLinks.map((link, index) => {
                                const isEditing = editingNavLinkId === link.id;
                                const summary = getNavigationSummary(link);
                                return (
                                    <div key={link.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{link.label || 'Untitled link'}</p>
                                                <p className="text-xs text-slate-400">{summary}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingNavLinkId(isEditing ? '' : link.id)}
                                                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                                >
                                                    {isEditing ? 'Done' : 'Edit'}
                                                </button>
                                                <button type="button" onClick={() => moveNavigationLink(link.id, -1)} disabled={index === 0} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40">
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => moveNavigationLink(link.id, 1)} disabled={index === navigationLinks.length - 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40">
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => removeNavigationLink(link.id)} className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mt-4 border-t border-slate-100 pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                                    <InputField
                                                        label="Label"
                                                        value={link.label}
                                                        onChange={(value) => updateNavigationLinkField(link.id, 'label', value)}
                                                        placeholder="Products"
                                                    />
                                                    <SelectField
                                                        label="Type"
                                                        value={link.type}
                                                        onChange={(value) => updateNavigationLinkField(link.id, 'type', value)}
                                                        options={[
                                                            { value: 'link', label: 'Standard Link' },
                                                            { value: 'dropdown', label: 'Dropdown Menu' },
                                                            { value: 'categories', label: 'Categories Mega Menu' },
                                                        ]}
                                                    />
                                                    <InputField
                                                        label="URL"
                                                        value={link.to}
                                                        onChange={(value) => updateNavigationLinkField(link.id, 'to', value)}
                                                        placeholder={link.type === 'categories' ? '/products' : link.type === 'dropdown' ? '(optional)' : '/about'}
                                                    />
                                                    <InputField
                                                        label="Badge"
                                                        value={link.badge || ''}
                                                        onChange={(value) => updateNavigationLinkField(link.id, 'badge', value)}
                                                        placeholder="New"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <ToggleField
                                                        label="Visible"
                                                        description="Hide the link without deleting it"
                                                        value={link.isVisible}
                                                        onChange={(value) => updateNavigationLinkField(link.id, 'isVisible', value)}
                                                    />
                                                    <ToggleField
                                                        label="Open in New Tab"
                                                        description="Useful for external destinations"
                                                        value={link.newTab}
                                                        onChange={(value) => updateNavigationLinkField(link.id, 'newTab', value)}
                                                    />
                                                </div>

                                                {link.type !== 'categories' && (
                                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                                        <div className="mb-4 flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">Dropdown Items</p>
                                                                <p className="text-xs text-slate-400">These items appear in desktop and mobile dropdown navigation.</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => addNavigationChildLink(link.id)}
                                                                className="px-3 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100"
                                                            >
                                                                Add Item
                                                            </button>
                                                        </div>

                                                        {link.children?.length ? (
                                                            <div className="space-y-3">
                                                                {link.children.map((child, childIndex) => (
                                                                    <div key={child.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_auto_auto_auto] gap-3 items-end rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                                        <InputField
                                                                            label="Label"
                                                                            value={child.label}
                                                                            onChange={(value) => updateNavigationChildLinkField(link.id, child.id, 'label', value)}
                                                                            placeholder="Sub Link"
                                                                        />
                                                                        <InputField
                                                                            label="URL"
                                                                            value={child.to}
                                                                            onChange={(value) => updateNavigationChildLinkField(link.id, child.id, 'to', value)}
                                                                            placeholder="/products/new"
                                                                        />
                                                                        <ToggleField
                                                                            label="Visible"
                                                                            description=""
                                                                            value={child.isVisible}
                                                                            onChange={(value) => updateNavigationChildLinkField(link.id, child.id, 'isVisible', value)}
                                                                        />
                                                                        <ToggleField
                                                                            label="New Tab"
                                                                            description=""
                                                                            value={child.newTab}
                                                                            onChange={(value) => updateNavigationChildLinkField(link.id, child.id, 'newTab', value)}
                                                                        />
                                                                        <div className="flex items-center gap-2">
                                                                            <button type="button" onClick={() => moveNavigationChildLink(link.id, child.id, -1)} disabled={childIndex === 0} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40">
                                                                                <ChevronUp className="h-4 w-4" />
                                                                            </button>
                                                                            <button type="button" onClick={() => moveNavigationChildLink(link.id, child.id, 1)} disabled={childIndex === (link.children?.length || 0) - 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40">
                                                                                <ChevronDown className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeNavigationChildLink(link.id, child.id)}
                                                                                className="h-11 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-medium"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-slate-500">No dropdown items yet. Add one to turn this link into a dropdown.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SettingsCard>

                <SettingsCard title="Footer Settings" description="Control newsletter, legal links, groups, and footer messaging">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ToggleField
                            label="Enable Newsletter"
                            description="Show the newsletter signup section"
                            value={storeData.footer?.newsletterEnabled}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, newsletterEnabled: value }))}
                        />
                        <ToggleField
                            label="Show Social Links"
                            description="Display linked social icons in the footer"
                            value={storeData.footer?.showSocialLinks}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, showSocialLinks: value }))}
                        />
                        <ToggleField
                            label="Show Contact Info"
                            description="Display address, phone, and email blocks"
                            value={storeData.footer?.showContactInfo}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, showContactInfo: value }))}
                        />
                        <ToggleField
                            label="Show Legal Links"
                            description="Display legal links in the footer bottom area"
                            value={storeData.footer?.showLegalLinks}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, showLegalLinks: value }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                        <InputField
                            label="Footer Tagline"
                            value={storeData.footer?.tagline || ''}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, tagline: value }))}
                            placeholder="Curated products with reliable support."
                            multiline
                            rows={2}
                        />
                        <InputField
                            label="Bottom Text"
                            value={storeData.footer?.bottomText || ''}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, bottomText: value }))}
                            placeholder="Built for modern storefronts."
                            multiline
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <InputField
                            label="Newsletter Title"
                            value={storeData.footer?.newsletterTitle || ''}
                            onChange={(value) => updateFooterConfig((footer) => ({ ...footer, newsletterTitle: value }))}
                            placeholder="Stay in the Loop"
                        />
                        <div>
                            <TextareaField
                                label="Newsletter Description"
                                value={storeData.footer?.newsletterDescription || ''}
                                onChange={(value) => updateFooterConfig((footer) => ({ ...footer, newsletterDescription: value }))}
                                rows={3}
                                placeholder="Get exclusive deals, launches, and insider updates delivered to your inbox."
                            />
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Footer Link Groups" description="Organize footer columns and maintain custom groups">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <p className="text-sm text-slate-500">Each group becomes a footer column or section depending on the selected footer template.</p>
                        <button
                            type="button"
                            onClick={startFooterGroupDraft}
                            disabled={Boolean(footerGroupDraft)}
                            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Add Group
                        </button>
                    </div>

                    {footerGroupDraft && (
                        <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">New Footer Group</p>
                                    <p className="text-xs text-slate-500">Give the group a name and add the first link.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={cancelFooterGroupDraft}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Group Title"
                                    value={footerGroupDraft.title}
                                    onChange={(value) => updateFooterGroupDraftField('title', value)}
                                    placeholder="Support"
                                />
                                <InputField
                                    label="First Link Label"
                                    value={footerGroupDraft.links?.[0]?.label || ''}
                                    onChange={(value) => updateFooterGroupDraftLinkField('label', value)}
                                    placeholder="Help Center"
                                />
                                <InputField
                                    label="First Link URL"
                                    value={footerGroupDraft.links?.[0]?.to || ''}
                                    onChange={(value) => updateFooterGroupDraftLinkField('to', value)}
                                    placeholder="/help"
                                />
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={commitFooterGroupDraft}
                                    className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
                                >
                                    Add Group
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelFooterGroupDraft}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {footerGroups.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                            No footer groups yet. Add a group to start organizing your footer columns.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {footerGroups.map((group, groupIndex) => {
                                const isEditing = editingFooterGroupId === group.id;
                                return (
                                    <div key={group.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{group.title || 'Untitled group'}</p>
                                                <p className="text-xs text-slate-400">{group.links?.length || 0} link{(group.links?.length || 0) === 1 ? '' : 's'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingFooterGroupId(isEditing ? '' : group.id)}
                                                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                                >
                                                    {isEditing ? 'Done' : 'Edit'}
                                                </button>
                                                <button type="button" onClick={() => moveFooterGroup(group.id, -1)} disabled={groupIndex === 0} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40">
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => moveFooterGroup(group.id, 1)} disabled={groupIndex === footerGroups.length - 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40">
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => removeFooterGroup(group.id)} className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mt-4 border-t border-slate-100 pt-4">
                                                <InputField
                                                    label="Group Title"
                                                    value={group.title}
                                                    onChange={(value) => updateFooterGroupField(group.id, 'title', value)}
                                                    placeholder="Support"
                                                />

                                                <div className="space-y-3 mt-4">
                                                    {(group.links || []).map((link) => (
                                                        <div key={link.id} className="grid grid-cols-1 md:grid-cols-[1.1fr_1.4fr_auto_auto] gap-3 items-end">
                                                            <InputField
                                                                label="Label"
                                                                value={link.label}
                                                                onChange={(value) => updateFooterGroupLinkField(group.id, link.id, 'label', value)}
                                                                placeholder="Help Center"
                                                            />
                                                            <InputField
                                                                label="URL"
                                                                value={link.to}
                                                                onChange={(value) => updateFooterGroupLinkField(group.id, link.id, 'to', value)}
                                                                placeholder="/help"
                                                            />
                                                            <ToggleField
                                                                label="New Tab"
                                                                description=""
                                                                value={link.newTab}
                                                                onChange={(value) => updateFooterGroupLinkField(group.id, link.id, 'newTab', value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFooterGroupLink(group.id, link.id)}
                                                                className="h-11 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => addFooterGroupLink(group.id)}
                                                    className="mt-4 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-slate-50"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Group Link
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SettingsCard>

                <SettingsCard title="Footer Legal Links" description="These links appear in the footer base and template-specific legal areas">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                        <p className="text-sm text-slate-500">Keep privacy and policy pages here, or replace them with your own set.</p>
                        <button
                            type="button"
                            onClick={startFooterLegalDraft}
                            disabled={Boolean(footerLegalDraft)}
                            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Add Legal Link
                        </button>
                    </div>

                    {footerLegalDraft && (
                        <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">New Legal Link</p>
                                    <p className="text-xs text-slate-500">Add the label and destination before saving.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={cancelFooterLegalDraft}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Label"
                                    value={footerLegalDraft.label}
                                    onChange={(value) => updateFooterLegalDraftField('label', value)}
                                    placeholder="Privacy Policy"
                                />
                                <InputField
                                    label="URL"
                                    value={footerLegalDraft.to}
                                    onChange={(value) => updateFooterLegalDraftField('to', value)}
                                    placeholder="/privacy"
                                />
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={commitFooterLegalDraft}
                                    className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
                                >
                                    Add Legal Link
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelFooterLegalDraft}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {footerLegalLinks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                            No legal links yet. Add links like privacy or terms pages.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {footerLegalLinks.map((link) => {
                                const isEditing = editingFooterLegalId === link.id;
                                return (
                                    <div key={link.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{link.label || 'Untitled link'}</p>
                                                <p className="text-xs text-slate-400">{link.to || 'No URL set'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingFooterLegalId(isEditing ? '' : link.id)}
                                                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                                >
                                                    {isEditing ? 'Done' : 'Edit'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFooterLegalLink(link.id)}
                                                    className="h-10 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="mt-4 border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputField
                                                    label="Label"
                                                    value={link.label}
                                                    onChange={(value) => updateFooterLegalLinkField(link.id, 'label', value)}
                                                    placeholder="Privacy Policy"
                                                />
                                                <InputField
                                                    label="URL"
                                                    value={link.to}
                                                    onChange={(value) => updateFooterLegalLinkField(link.id, 'to', value)}
                                                    placeholder="/privacy"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SettingsCard>
            </div>
        );
    }
    function renderHomepageTab() {
        const heroSlides = storeData.homepage?.heroSlides || [];

        return (
            <div className="space-y-6">
                <SettingsCard title="Hero Slides" description="Create, edit, reorder, and remove homepage hero slides">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm text-slate-600">These slides power the main homepage banner. The homepage falls back to store info only when no slide is configured.</p>
                            <p className="text-xs text-slate-400 mt-1">Recommended image size: 1920x1080</p>
                        </div>
                        <button
                            type="button"
                            onClick={startHeroSlideDraft}
                            disabled={Boolean(heroSlideDraft)}
                            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Add Slide
                        </button>
                    </div>

                    {heroSlideDraft && (
                        <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">New Hero Slide</p>
                                    <p className="text-xs text-slate-500">Add the essentials now, then fine-tune after saving.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={cancelHeroSlideDraft}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Badge"
                                    value={heroSlideDraft.badge}
                                    onChange={(value) => updateHeroSlideDraftField('badge', value)}
                                    placeholder="New arrival"
                                />
                                <SelectField
                                    label="Gradient"
                                    value={heroSlideDraft.gradient}
                                    onChange={(value) => updateHeroSlideDraftField('gradient', value)}
                                    options={HERO_SLIDE_GRADIENTS.map((option) => ({
                                        value: option.value,
                                        label: option.label,
                                    }))}
                                />
                                <div className="md:col-span-2">
                                    <TextareaField
                                        label="Title"
                                        value={heroSlideDraft.title}
                                        onChange={(value) => updateHeroSlideDraftField('title', value)}
                                        rows={2}
                                        placeholder="Elevate your everyday essentials"
                                        resizeClassName="resize-y"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <TextareaField
                                        label="Subtitle"
                                        value={heroSlideDraft.subtitle}
                                        onChange={(value) => updateHeroSlideDraftField('subtitle', value)}
                                        rows={3}
                                        placeholder="Describe the featured collection or offer."
                                        resizeClassName="resize-y"
                                    />
                                </div>
                                <InputField
                                    label="CTA Label"
                                    value={heroSlideDraft.cta}
                                    onChange={(value) => updateHeroSlideDraftField('cta', value)}
                                    placeholder="Shop now"
                                    multiline
                                    rows={2}
                                />
                                <InputField
                                    label="CTA Link"
                                    value={heroSlideDraft.ctaLink}
                                    onChange={(value) => updateHeroSlideDraftField('ctaLink', value)}
                                    placeholder="/products"
                                />
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Background Image URL"
                                        value={heroSlideDraft.image}
                                        onChange={(value) => updateHeroSlideDraftField('image', value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={commitHeroSlideDraft}
                                    className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
                                >
                                    Add Slide
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelHeroSlideDraft}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {heroSlides.length === 0 && !heroSlideDraft && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                            <Image className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-700">No hero slides configured</p>
                            <p className="text-sm text-slate-500 mt-1">Add your first slide to control the homepage hero section from admin.</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {heroSlides.map((slide, index) => {
                            const isEditing = editingHeroSlideId === slide.id;
                            return (
                                <div key={slide.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                                    <div className={`relative p-6 bg-gradient-to-r ${slide.gradient}`}>
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-25"
                                            style={{ backgroundImage: slide.image ? `url(${slide.image})` : 'none' }}
                                        />
                                        <div className="absolute inset-0 bg-slate-950/50" />
                                        <div className="relative flex items-start justify-between gap-4">
                                            <div className="max-w-xl text-white">
                                                <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2">{slide.badge || 'Hero Slide'}</p>
                                                <h3 className="text-2xl font-bold whitespace-pre-line">{slide.title || 'Untitled slide'}</h3>
                                                <p className="text-sm text-white/70 mt-2">{slide.subtitle || 'Add a supporting description for this slide.'}</p>
                                                <div className="mt-4 inline-flex items-center rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-medium">
                                                    {slide.cta || 'Shop Now'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingHeroSlideId(isEditing ? '' : slide.id)}
                                                    className="px-3 py-2 text-xs font-semibold text-white/90 bg-white/10 rounded-xl hover:bg-white/20"
                                                >
                                                    {isEditing ? 'Done' : 'Edit'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveHeroSlide(slide.id, -1)}
                                                    disabled={index === 0}
                                                    className="p-2 rounded-xl bg-white/10 text-white border border-white/10 disabled:opacity-40"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveHeroSlide(slide.id, 1)}
                                                    disabled={index === heroSlides.length - 1}
                                                    className="p-2 rounded-xl bg-white/10 text-white border border-white/10 disabled:opacity-40"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeHeroSlide(slide.id)}
                                                    className="p-2 rounded-xl bg-rose-500/20 text-white border border-rose-200/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <InputField
                                                label="Badge"
                                                value={slide.badge}
                                                onChange={(value) => handleHeroSlideChange(slide.id, 'badge', value)}
                                                placeholder="New arrival"
                                            />
                                            <SelectField
                                                label="Gradient"
                                                value={slide.gradient}
                                                onChange={(value) => handleHeroSlideChange(slide.id, 'gradient', value)}
                                                options={HERO_SLIDE_GRADIENTS.map((option) => ({
                                                    value: option.value,
                                                    label: option.label,
                                                }))}
                                            />
                                            <div className="md:col-span-2">
                                                <TextareaField
                                                    label="Title"
                                                    value={slide.title}
                                                    onChange={(value) => handleHeroSlideChange(slide.id, 'title', value)}
                                                    rows={2}
                                                    placeholder="Elevate your everyday essentials"
                                                    resizeClassName="resize-y"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <TextareaField
                                                    label="Subtitle"
                                                    value={slide.subtitle}
                                                    onChange={(value) => handleHeroSlideChange(slide.id, 'subtitle', value)}
                                                    rows={3}
                                                    placeholder="Describe the featured collection or offer."
                                                    resizeClassName="resize-y"
                                                />
                                            </div>
                                            <InputField
                                                label="CTA Label"
                                                value={slide.cta}
                                                onChange={(value) => handleHeroSlideChange(slide.id, 'cta', value)}
                                                placeholder="Shop now"
                                                multiline
                                                rows={2}
                                            />
                                            <InputField
                                                label="CTA Link"
                                                value={slide.ctaLink}
                                                onChange={(value) => handleHeroSlideChange(slide.id, 'ctaLink', value)}
                                                placeholder="/products"
                                            />
                                            <div className="md:col-span-2">
                                                <InputField
                                                    label="Background Image URL"
                                                    value={slide.image}
                                                    onChange={(value) => handleHeroSlideChange(slide.id, 'image', value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Image</label>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                                                        <Upload className="h-4 w-4" />
                                                        {uploadingSlideId === slide.id ? 'Uploading...' : 'Upload Image'}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            disabled={uploadingSlideId === slide.id}
                                                            onChange={(event) => handleHeroSlideImageUpload(slide.id, event)}
                                                        />
                                                    </label>
                                                    {slide.image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleHeroSlideChange(slide.id, 'image', '')}
                                                            className="px-4 py-2 text-sm font-medium text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </SettingsCard>
            </div>
        );
    }
    function renderShippingTab() {
        const shippingOptions = storeData.shippingConfig?.options || [];
        const defaultOptionId = storeData.shippingConfig?.defaultOptionId || shippingOptions[0]?.id || '';

        return (
            <div className="space-y-6">
                <SettingsCard title="Shipping Options" description="Configure shipping methods, pricing, and city-specific charges">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <ToggleField
                                label="Enable Free Shipping"
                                description="Allow free shipping when order total exceeds a threshold"
                                value={storeData.shippingConfig.enableFreeShipping}
                                onChange={(v) => handleStoreChange('shippingConfig.enableFreeShipping', v)}
                            />
                            <InputField
                                label="Free Shipping Threshold ($)"
                                value={storeData.shippingConfig.freeShippingThreshold}
                                onChange={(v) => handleStoreChange('shippingConfig.freeShippingThreshold', parseFloat(v) || 0)}
                                type="number"
                                icon={<DollarSign className="h-4 w-4" />}
                            />
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900">Shipping Methods</h4>
                                    <p className="text-xs text-slate-500">Customers can pick from these options at checkout.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={startShippingOptionDraft}
                                    disabled={Boolean(shippingOptionDraft)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Option
                                </button>
                            </div>

                            {shippingOptionDraft && (
                                <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">New Shipping Option</p>
                                            <p className="text-xs text-slate-500">Add the basics now, then fine-tune city overrides later.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={cancelShippingOptionDraft}
                                            className="text-xs font-medium text-slate-500 hover:text-slate-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            label="Option Name"
                                            value={shippingOptionDraft.label}
                                            onChange={(value) => updateShippingOptionDraft('label', value)}
                                            placeholder="Standard Delivery"
                                        />
                                        <InputField
                                            label="Base Rate ($)"
                                            value={shippingOptionDraft.baseRate}
                                            onChange={(value) => updateShippingOptionDraft('baseRate', parseFloat(value) || 0)}
                                            type="number"
                                            icon={<DollarSign className="h-4 w-4" />}
                                        />
                                        <InputField
                                            label="Min Delivery Days"
                                            value={shippingOptionDraft.estimatedDaysMin}
                                            onChange={(value) => updateShippingOptionDraft('estimatedDaysMin', parseInt(value, 10) || 0)}
                                            type="number"
                                        />
                                        <InputField
                                            label="Max Delivery Days"
                                            value={shippingOptionDraft.estimatedDaysMax}
                                            onChange={(value) => updateShippingOptionDraft('estimatedDaysMax', parseInt(value, 10) || 0)}
                                            type="number"
                                        />
                                        <div className="md:col-span-2">
                                            <TextareaField
                                                label="Description"
                                                value={shippingOptionDraft.description || ''}
                                                onChange={(value) => updateShippingOptionDraft('description', value)}
                                                placeholder="Short delivery note shown at checkout"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <ToggleField
                                            label="Enabled"
                                            description="Show this option to customers"
                                            value={shippingOptionDraft.enabled !== false}
                                            onChange={(value) => updateShippingOptionDraft('enabled', value)}
                                        />
                                        <ToggleField
                                            label="Eligible for Free Shipping"
                                            description="Allow free shipping threshold to apply"
                                            value={shippingOptionDraft.freeShippingEligible !== false}
                                            onChange={(value) => updateShippingOptionDraft('freeShippingEligible', value)}
                                        />
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={commitShippingOptionDraft}
                                            className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
                                        >
                                            Add Option
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelShippingOptionDraft}
                                            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {shippingOptions.length === 0 ? (
                                <div className="text-sm text-slate-500">No shipping options yet. Add one to get started.</div>
                            ) : (
                                <div className="space-y-4">
                                    <SelectField
                                        label="Default Shipping Option"
                                        value={defaultOptionId}
                                        onChange={setDefaultShippingOption}
                                        options={shippingOptions.map((option, index) => ({
                                            value: option.id,
                                            label: option.label || `Shipping Option ${index + 1}`,
                                        }))}
                                    />

                                    <div className="space-y-4">
                                        {shippingOptions.map((option, index) => {
                                            const isEditing = editingShippingOptionId === option.id;
                                            const optionLabel = option.label || `Shipping Option ${index + 1}`;
                                            const isDefault = defaultOptionId === option.id;
                                            return (
                                                <div key={option.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {optionLabel}
                                                                {isDefault && (
                                                                    <span className="ml-2 inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                ${option.baseRate || 0}  {option.estimatedDaysMin || 0}-{option.estimatedDaysMax || 0} days  {option.enabled !== false ? 'Enabled' : 'Disabled'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingShippingOptionId(isEditing ? '' : option.id)}
                                                                className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                                                            >
                                                                {isEditing ? 'Done' : 'Edit'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeShippingOption(option.id)}
                                                                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isEditing && (
                                                        <div className="mt-4 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <InputField
                                                                    label="Option Name"
                                                                    value={option.label}
                                                                    onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                        ...current,
                                                                        label: value,
                                                                    }))}
                                                                    placeholder="Standard Delivery"
                                                                />
                                                                <InputField
                                                                    label="Base Rate ($)"
                                                                    value={option.baseRate}
                                                                    onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                        ...current,
                                                                        baseRate: parseFloat(value) || 0,
                                                                    }))}
                                                                    type="number"
                                                                    icon={<DollarSign className="h-4 w-4" />}
                                                                />
                                                                <InputField
                                                                    label="Min Delivery Days"
                                                                    value={option.estimatedDaysMin}
                                                                    onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                        ...current,
                                                                        estimatedDaysMin: parseInt(value, 10) || 0,
                                                                    }))}
                                                                    type="number"
                                                                />
                                                                <InputField
                                                                    label="Max Delivery Days"
                                                                    value={option.estimatedDaysMax}
                                                                    onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                        ...current,
                                                                        estimatedDaysMax: parseInt(value, 10) || 0,
                                                                    }))}
                                                                    type="number"
                                                                />
                                                                <div className="md:col-span-2">
                                                                    <TextareaField
                                                                        label="Description"
                                                                        value={option.description || ''}
                                                                        onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                            ...current,
                                                                            description: value,
                                                                        }))}
                                                                        placeholder="Short delivery note shown at checkout"
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <ToggleField
                                                                    label="Enabled"
                                                                    description="Show this option to customers"
                                                                    value={option.enabled !== false}
                                                                    onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                        ...current,
                                                                        enabled: value,
                                                                    }))}
                                                                />
                                                                <ToggleField
                                                                    label="Eligible for Free Shipping"
                                                                    description="Allow free shipping threshold to apply"
                                                                    value={option.freeShippingEligible !== false}
                                                                    onChange={(value) => updateShippingOption(option.id, (current) => ({
                                                                        ...current,
                                                                        freeShippingEligible: value,
                                                                    }))}
                                                                />
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-900">City Overrides</p>
                                                                        <p className="text-xs text-slate-500">Charge different rates for specific cities.</p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addCityRate(option.id)}
                                                                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                        Add City Rate
                                                                    </button>
                                                                </div>

                                                                {(option.cityRates || []).length === 0 ? (
                                                                    <p className="text-xs text-slate-400">No city overrides yet.</p>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        {(option.cityRates || []).map((rate) => (
                                                                            <div key={rate.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end">
                                                                                <InputField
                                                                                    label="City"
                                                                                    value={rate.city}
                                                                                    onChange={(value) => updateCityRate(option.id, rate.id, 'city', value)}
                                                                                    placeholder="e.g. Dhaka"
                                                                                />
                                                                                <InputField
                                                                                    label="Rate ($)"
                                                                                    value={rate.rate}
                                                                                    onChange={(value) => updateCityRate(option.id, rate.id, 'rate', parseFloat(value) || 0)}
                                                                                    type="number"
                                                                                    icon={<DollarSign className="h-4 w-4" />}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeCityRate(option.id, rate.id)}
                                                                                    className="inline-flex items-center justify-center h-10 px-3 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </SettingsCard>
            </div>
        );
    }

    function renderTaxTab() {
        return (
            <div className="space-y-6">
                <SettingsCard title="Tax Configuration" description="Set up tax rates for your store">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Tax Rate (%)" value={storeData.taxRate} onChange={(v) => handleStoreChange('taxRate', v)} type="number" icon={<Percent className="h-4 w-4" />} />
                        <SelectField label="Currency" value={storeData.currency} onChange={(v) => handleStoreChange('currency', v)} options={CURRENCIES.map(c => ({ value: c.code, label: `${c.symbol} ${c.name} (${c.code})` }))} />
                        <SelectField label="Language" value={storeData.language} onChange={(v) => handleStoreChange('language', v)} options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))} />
                    </div>
                </SettingsCard>
            </div>
        );
    }

    function renderSeoTab() {
        return (
            <div className="space-y-6">
                <SettingsCard title="Search Engine Optimization" description="Improve your store's visibility on search engines">
                    <div className="space-y-5">
                        <InputField label="SEO Title" value={storeData.seo.title} onChange={(v) => handleStoreChange('seo.title', v)} placeholder="My Store - Best Products Online" icon={<Type className="h-4 w-4" />} />
                        <div>
                            <TextareaField
                                label="Meta Description"
                                value={storeData.seo.description}
                                onChange={(value) => handleStoreChange('seo.description', value)}
                                placeholder="A compelling description of your store for search engines..."
                                rows={3}
                                maxLength={160}
                            />
                            <p className="text-xs text-slate-400 mt-1">{storeData.seo.description.length}/160 characters</p>
                        </div>
                        <InputField label="Keywords" value={storeData.seo.keywords} onChange={(v) => handleStoreChange('seo.keywords', v)} placeholder="ecommerce, fashion, online store" icon={<Search className="h-4 w-4" />} />
                        <InputField label="OG Image URL" value={storeData.seo.ogImage} onChange={(v) => handleStoreChange('seo.ogImage', v)} placeholder="https://..." icon={<Image className="h-4 w-4" />} />
                    </div>

                    {/* SEO Preview */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-400 mb-2 uppercase font-medium tracking-wider">Google Preview</p>
                        <div className="space-y-1">
                            <p className="text-blue-700 text-lg font-medium truncate">{storeData.seo.title || storeData.name || 'Your Store Title'}</p>
                            <p className="text-green-700 text-sm">{`https://yourstore.com/${storeData.slug || 'store'}`}</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{storeData.seo.description || 'Your store description will appear here...'}</p>
                        </div>
                    </div>
                </SettingsCard>
            </div>
        );
    }

    function renderSocialTab() {
        return (
            <div className="space-y-6">
                <SettingsCard title="Social Media Links" description="Connect your social media profiles">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Facebook" value={storeData.socialLinks.facebook} onChange={(v) => handleStoreChange('socialLinks.facebook', v)} placeholder="https://facebook.com/yourstore" />
                        <InputField label="Instagram" value={storeData.socialLinks.instagram} onChange={(v) => handleStoreChange('socialLinks.instagram', v)} placeholder="https://instagram.com/yourstore" />
                        <InputField label="Twitter / X" value={storeData.socialLinks.twitter} onChange={(v) => handleStoreChange('socialLinks.twitter', v)} placeholder="https://x.com/yourstore" />
                        <InputField label="YouTube" value={storeData.socialLinks.youtube} onChange={(v) => handleStoreChange('socialLinks.youtube', v)} placeholder="https://youtube.com/@yourstore" />
                        <InputField label="TikTok" value={storeData.socialLinks.tiktok} onChange={(v) => handleStoreChange('socialLinks.tiktok', v)} placeholder="https://tiktok.com/@yourstore" />
                        <InputField label="Pinterest" value={storeData.socialLinks.pinterest} onChange={(v) => handleStoreChange('socialLinks.pinterest', v)} placeholder="https://pinterest.com/yourstore" />
                    </div>
                </SettingsCard>
            </div>
        );
    }

};

// ââ Reusable Components âââââââââââââââââââââââââââââââââ

const SettingsCard = ({ title, description, children }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="mb-5">
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
        </div>
        {children}
    </div>
);

const stopKeyboardPropagation = (event) => {
    event.stopPropagation();
};

const getFieldClassName = ({ hasIcon = false, resizeClassName = 'resize-none' } = {}) => (
    `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all ${resizeClassName}`
);

const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    icon,
    className = '',
    multiline = false,
    rows = 3,
    maxLength,
}) => {
    if (multiline) {
        return (
            <TextareaField
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
                rows={rows}
                maxLength={maxLength}
            />
        );
    }

    const resolvedType = type === 'email' ? 'text' : type;
    const inputMode = type === 'email' ? 'email' : undefined;
    const autoComplete = type === 'email' ? 'email' : undefined;

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={resolvedType}
                    inputMode={inputMode}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={stopKeyboardPropagation}
                    onKeyUp={stopKeyboardPropagation}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={getFieldClassName({ hasIcon: Boolean(icon) })}
                />
            </div>
        </div>
    );
};

const TextareaField = ({
    label,
    value,
    onChange,
    placeholder,
    className = '',
    rows = 3,
    maxLength,
    resizeClassName = 'resize-none',
}) => (
    <div className={className}>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={stopKeyboardPropagation}
            onKeyUp={stopKeyboardPropagation}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={getFieldClassName({ resizeClassName })}
        />
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={stopKeyboardPropagation}
            onKeyUp={stopKeyboardPropagation}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white transition-all appearance-none cursor-pointer"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const ColorPicker = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="flex items-center gap-3">
            <div className="relative">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={stopKeyboardPropagation}
                    onKeyUp={stopKeyboardPropagation}
                    className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer appearance-none overflow-hidden"
                    style={{ padding: 0 }}
                />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={stopKeyboardPropagation}
                onKeyUp={stopKeyboardPropagation}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none font-mono uppercase"
            />
        </div>
    </div>
);

const ProductCardVariantSelector = ({ value, onChange, primaryColor, accentColor }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {PRODUCT_CARD_VARIANT_OPTIONS.map((option, index) => {
            const isActive = value === option.value;
            return (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${isActive
                        ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                >
                    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-3 flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <div
                                    className="h-2 rounded-full"
                                    style={{ width: `${60 + (index % 3) * 12}px`, backgroundColor: primaryColor }}
                                />
                                <div className="h-2 w-12 rounded-full bg-slate-200" />
                            </div>
                            <div
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: accentColor }}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 rounded-lg bg-white border border-slate-200" />
                            <div className="flex items-center justify-between gap-2">
                                <div className="h-2 w-14 rounded-full bg-slate-200" />
                                <div
                                    className="h-6 w-16 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                            <p className="text-xs text-slate-500">Use this as your default storefront card</p>
                        </div>
                        {isActive && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white">
                                <Check className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                </button>
            );
        })}
    </div>
);

const ToggleField = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
        <div>
            <p className="font-medium text-sm text-slate-900">{label}</p>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-violet-600' : 'bg-slate-300'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

export default AdminStoreSettings;

