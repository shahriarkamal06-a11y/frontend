import Head from 'next/head';
import App from '../App';
import { InitialDataProvider } from '../ssr/initial-data';
import { buildSeoMeta, fetchInitialRouteData } from '../ssr/server-data';
import { getThemeCssVars } from '../utils';

export default function CatchAllPage({ requestPath, initialData, seo }) {
  const faviconUrl = initialData?.storeSettings?.store?.faviconUrl;
  const themeVars = getThemeCssVars(initialData?.storeSettings?.theme || {});
  const themeCssText = Object.entries(themeVars)
    .map(([key, value]) => `${key}:${value};`)
    .join('');

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.keywords ? <meta name="keywords" content={seo.keywords} /> : null}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        {seo.image ? <meta property="og:image" content={seo.image} /> : null}
        {faviconUrl ? <link rel="icon" href={faviconUrl} /> : null}
        {themeCssText ? <style id="storefront-theme-vars">{`:root{${themeCssText}}`}</style> : null}
      </Head>
      <InitialDataProvider value={initialData}>
        <App initialData={initialData} location={requestPath} />
      </InitialDataProvider>
    </>
  );
}

export async function getCatchAllServerSideProps(context) {
  const requestPath = context.resolvedUrl || '/';
  const headers = context?.req?.headers || {};
  const storeDomain = headers['x-store-domain'] || headers['x-forwarded-host'] || headers['host'] || '';
  const initialData = await fetchInitialRouteData({
    params: context.params || {},
    query: context.query || {},
    requestPath,
    storeDomain,
  });

  if (initialData?.routeType === 'not-found' && context?.res) {
    context.res.statusCode = 404;
  }

  return {
    props: {
      requestPath,
      initialData,
      seo: buildSeoMeta(initialData),
    },
  };
}
