import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { contentPageAPI, pageAPI, productAPI } from '../../services/api';
import { normalizeProduct } from '../../hooks/useApi';
import { useInitialData } from '../../ssr/initial-data';
import { useStoreSettingsStore } from '../../store';
import NotFoundPage from './NotFoundPage';
import RichContent from '../../components/content/RichContent';
import PageBuilderRenderer from '../../components/page-builder/PageBuilderRenderer';
import {
  extractLinkedProductIds,
  normalizePageRecord,
  sortProductsByIds,
} from '../../utils/pageBuilder';
import {
  getContentPagePath,
  normalizeContentPage,
  slugifyContentPage,
} from '../../utils/contentPages';

const getResponseItems = (response) => response?.data?.data?.items || response?.data?.items || [];

const applyDocumentMeta = (title, description) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.title = title;

  let descriptionTag = document.querySelector('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement('meta');
    descriptionTag.setAttribute('name', 'description');
    document.head.appendChild(descriptionTag);
  }

  descriptionTag.setAttribute('content', description || '');
};

const StorefrontPageLoadingState = () => (
  <div className="bg-white py-20">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-6 w-28 rounded-full bg-slate-200" />
        <div className="h-14 w-2/3 rounded-3xl bg-slate-200" />
        <div className="h-5 w-full rounded-2xl bg-slate-100" />
        <div className="h-5 w-5/6 rounded-2xl bg-slate-100" />
        <div className="space-y-4 rounded-[32px] border border-slate-200 bg-slate-50 p-8">
          <div className="h-4 w-full rounded-2xl bg-slate-200" />
          <div className="h-4 w-full rounded-2xl bg-slate-200" />
          <div className="h-4 w-4/5 rounded-2xl bg-slate-200" />
          <div className="h-40 rounded-[28px] bg-slate-200" />
        </div>
      </div>
    </div>
  </div>
);

const ContentPageLayout = ({ page }) => (
  <section className="bg-white py-10 lg:py-14">
    <div className="container mx-auto px-4 lg:px-8">
      <RichContent
        content={page.content?.trim() ? page.content : `# ${page.title}`}
        containerClassName="mx-auto max-w-6xl"
      />
    </div>
  </section>
);

const DynamicStorefrontPage = () => {
  const location = useLocation();
  const initialData = useInitialData();
  const store = useStoreSettingsStore((state) => state.store);
  const pathname = location.pathname;
  const matchingInitialData = initialData?.pathname === pathname ? initialData : null;

  const [contentPage, setContentPage] = useState(() => (
    matchingInitialData?.routeType === 'content-page'
      ? normalizeContentPage(matchingInitialData.routeData?.page)
      : null
  ));
  const [builderPage, setBuilderPage] = useState(() => (
    matchingInitialData?.routeType === 'custom-page'
      ? normalizePageRecord(matchingInitialData.routeData?.page)
      : null
  ));
  const [linkedProducts, setLinkedProducts] = useState(() => (
    matchingInitialData?.routeType === 'custom-page'
      ? (matchingInitialData.routeData?.linkedProducts || []).map(normalizeProduct)
      : []
  ));
  const [loading, setLoading] = useState(() => !matchingInitialData);
  const [notFound, setNotFound] = useState(() => matchingInitialData?.routeType === 'not-found');

  const activePageTitle = useMemo(() => {
    if (contentPage) {
      if (contentPage.metaTitle) return contentPage.metaTitle;
      if (contentPage.title && store.name) return `${contentPage.title} | ${store.name}`;
      return contentPage.title || store.name || 'Page';
    }

    if (builderPage?.seo?.title) return builderPage.seo.title;
    if (builderPage?.title && store.name) return `${builderPage.title} | ${store.name}`;
    if (notFound) return store.name ? `Page not found | ${store.name}` : 'Page not found';
    return store.seo?.title || store.name || 'Store';
  }, [builderPage?.seo?.title, builderPage?.title, contentPage, notFound, store.name, store.seo?.title]);

  const activePageDescription = useMemo(() => {
    if (contentPage) {
      return contentPage.metaDescription || store.seo?.description || store.description || '';
    }

    if (builderPage) {
      return builderPage.seo?.description || store.seo?.description || store.description || '';
    }

    return store.seo?.description || store.description || '';
  }, [builderPage, contentPage, store.description, store.seo?.description]);

  useEffect(() => {
    if (!loading) {
      applyDocumentMeta(activePageTitle, activePageDescription);
    }
  }, [activePageDescription, activePageTitle, loading]);

  useEffect(() => {
    let cancelled = false;

    const setContentState = (page) => {
      setContentPage(page);
      setBuilderPage(null);
      setLinkedProducts([]);
      setNotFound(false);
    };

    const setBuilderState = (page, products) => {
      setBuilderPage(page);
      setLinkedProducts(products);
      setContentPage(null);
      setNotFound(false);
    };

    const hydrateFromInitialData = () => {
      if (!matchingInitialData) {
        return false;
      }

      if (matchingInitialData.routeType === 'content-page') {
        setContentState(normalizeContentPage(matchingInitialData.routeData?.page));
        setLoading(false);
        return true;
      }

      if (matchingInitialData.routeType === 'custom-page') {
        setBuilderState(
          normalizePageRecord(matchingInitialData.routeData?.page),
          (matchingInitialData.routeData?.linkedProducts || []).map(normalizeProduct)
        );
        setLoading(false);
        return true;
      }

      if (matchingInitialData.routeType === 'not-found') {
        setContentPage(null);
        setBuilderPage(null);
        setLinkedProducts([]);
        setNotFound(true);
        setLoading(false);
        return true;
      }

      return false;
    };

    if (hydrateFromInitialData()) {
      return () => {
        cancelled = true;
      };
    }

    const slug = slugifyContentPage(pathname);
    if (!slug) {
      setContentPage(null);
      setBuilderPage(null);
      setLinkedProducts([]);
      setNotFound(true);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadDynamicPage = async () => {
      setLoading(true);

      try {
        const contentResponse = await contentPageAPI.getPageBySlug(slug);
        if (!cancelled) {
          setContentState(normalizeContentPage(contentResponse?.data?.data));
          setLoading(false);
        }
        return;
      } catch {
        // Fall through to the existing page builder pages.
      }

      try {
        const pageResponse = await pageAPI.getPageBySlug(slug);
        const nextPage = normalizePageRecord(pageResponse?.data?.data);
        const productIds = extractLinkedProductIds(nextPage.content);

        let nextProducts = [];
        if (productIds.length > 0) {
          const productsResponse = await productAPI.getProducts({
            ids: productIds.join(','),
            active: 'true',
            limit: String(productIds.length),
            page: '1',
          });

          nextProducts = sortProductsByIds(
            getResponseItems(productsResponse).map(normalizeProduct),
            productIds
          );
        }

        if (!cancelled) {
          setBuilderState(nextPage, nextProducts);
        }
      } catch {
        if (!cancelled) {
          setContentPage(null);
          setBuilderPage(null);
          setLinkedProducts([]);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDynamicPage();

    return () => {
      cancelled = true;
    };
  }, [matchingInitialData, pathname]);

  if (loading) {
    return <StorefrontPageLoadingState />;
  }

  if (notFound || (!contentPage && !builderPage)) {
    return <NotFoundPage />;
  }

  if (contentPage) {
    return <ContentPageLayout key={getContentPagePath(contentPage.slug)} page={contentPage} />;
  }

  return <PageBuilderRenderer page={builderPage} linkedProducts={linkedProducts} />;
};

export default DynamicStorefrontPage;
