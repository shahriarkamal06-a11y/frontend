import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { pageAPI, productAPI } from '../../services/api';
import { normalizeProduct } from '../../hooks/useApi';
import { useInitialData } from '../../ssr/initial-data';
import { useStoreSettingsStore } from '../../store';
import NotFoundPage from './NotFoundPage';
import PageBuilderRenderer from '../../components/page-builder/PageBuilderRenderer';
import {
  extractLinkedProductIds,
  normalizePageRecord,
  slugifyPagePath,
  sortProductsByIds,
} from '../../utils/pageBuilder';

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

const PageBuilderLoadingState = () => (
  <div className="bg-white py-20">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-6 w-28 rounded-full bg-slate-200" />
        <div className="h-14 w-2/3 rounded-3xl bg-slate-200" />
        <div className="h-5 w-full rounded-2xl bg-slate-100" />
        <div className="h-5 w-4/5 rounded-2xl bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="aspect-[4/5] rounded-[28px] bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PageBuilderPage = () => {
  const location = useLocation();
  const initialData = useInitialData();
  const store = useStoreSettingsStore((state) => state.store);
  const pathname = location.pathname;
  const matchingInitialData = initialData?.pathname === pathname ? initialData : null;

  const [page, setPage] = useState(() => (
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

  const pageTitle = useMemo(() => {
    if (page?.seo?.title) {
      return page.seo.title;
    }

    if (page?.title && store.name) {
      return `${page.title} | ${store.name}`;
    }

    return page?.title || store.name || 'Page';
  }, [page?.seo?.title, page?.title, store.name]);

  const pageDescription = page?.seo?.description || store.seo?.description || store.description || '';

  useEffect(() => {
    if (page) {
      applyDocumentMeta(pageTitle, pageDescription);
      return;
    }

    if (notFound) {
      applyDocumentMeta(store.name ? `Page not found | ${store.name}` : 'Page not found', store.seo?.description || store.description || '');
    }
  }, [notFound, page, pageDescription, pageTitle, store.description, store.name, store.seo?.description]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromInitialData = () => {
      if (!matchingInitialData) {
        return false;
      }

      if (matchingInitialData.routeType === 'custom-page') {
        setPage(normalizePageRecord(matchingInitialData.routeData?.page));
        setLinkedProducts((matchingInitialData.routeData?.linkedProducts || []).map(normalizeProduct));
        setNotFound(false);
        setLoading(false);
        return true;
      }

      if (matchingInitialData.routeType === 'not-found') {
        setPage(null);
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

    const slug = slugifyPagePath(pathname);
    if (!slug) {
      setPage(null);
      setLinkedProducts([]);
      setNotFound(true);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadPage = async () => {
      setLoading(true);

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
          setPage(nextPage);
          setLinkedProducts(nextProducts);
          setNotFound(false);
        }
      } catch {
        if (!cancelled) {
          setPage(null);
          setLinkedProducts([]);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [matchingInitialData, pathname]);

  if (loading) {
    return <PageBuilderLoadingState />;
  }

  if (notFound || !page) {
    return <NotFoundPage />;
  }

  return <PageBuilderRenderer page={page} linkedProducts={linkedProducts} />;
};

export default PageBuilderPage;
