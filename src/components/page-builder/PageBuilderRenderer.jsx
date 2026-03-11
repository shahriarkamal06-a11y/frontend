import { Link } from 'react-router-dom';
import ProductsCardAll from '../products/ProductsCardAll';
import { getPagePath, sortProductsByIds } from '../../utils/pageBuilder';

const renderParagraphs = (value = '') => (
  String(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
);

const ActionButton = ({ href, label, secondary = false }) => {
  if (!href || !label) {
    return null;
  }

  const isExternal = /^https?:\/\//i.test(href);
  const resolvedHref = isExternal ? href : `/${String(href).replace(/^\/+/, '')}`;
  const className = secondary
    ? 'inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white'
    : 'inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800';

  if (isExternal) {
    return (
      <a href={resolvedHref} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link to={resolvedHref} className={className}>
      {label}
    </Link>
  );
};

const PRODUCT_GRID_CLASS_MAP = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

const HeroBlock = ({ data }) => {
  const alignClass = data.align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.26),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.2),_transparent_32%)]" />
      {data.imageUrl ? (
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <img src={data.imageUrl} alt="" className="h-full w-full object-cover opacity-30" />
        </div>
      ) : null}
      <div className="relative container mx-auto px-4 py-20 lg:px-8 lg:py-28">
        <div className={`flex max-w-3xl flex-col gap-5 ${alignClass}`}>
          {data.eyebrow ? (
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              {data.eyebrow}
            </span>
          ) : null}
          <h1 className="text-4xl font-bold leading-tight text-white lg:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
            {data.heading}
          </h1>
          {data.body ? (
            <p className="max-w-2xl text-base leading-7 text-white/72 lg:text-lg">
              {data.body}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <ActionButton href={data.primaryHref} label={data.primaryLabel} />
            <ActionButton href={data.secondaryHref} label={data.secondaryLabel} secondary />
          </div>
        </div>
      </div>
    </section>
  );
};

const RichTextBlock = ({ data }) => (
  <section className="bg-white py-16">
    <div className="container mx-auto max-w-4xl px-4 lg:px-8">
      {data.heading ? (
        <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
          {data.heading}
        </h2>
      ) : null}
      <div className="mt-5 space-y-4 text-base leading-8 text-slate-600">
        {renderParagraphs(data.body).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  </section>
);

const ImageBlock = ({ data }) => {
  const aspectClass = data.aspect === 'square' ? 'aspect-square max-w-2xl' : 'aspect-[16/7]';

  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`mx-auto overflow-hidden rounded-[32px] bg-white shadow-sm ${aspectClass}`}>
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.altText || ''} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-medium text-slate-500">
              Add an image in the page builder
            </div>
          )}
        </div>
        {data.caption ? (
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-slate-500">{data.caption}</p>
        ) : null}
      </div>
    </section>
  );
};

const FeatureListBlock = ({ data }) => (
  <section className="bg-white py-16">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-3xl">
        {data.heading ? (
          <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
            {data.heading}
          </h2>
        ) : null}
        {data.body ? (
          <p className="mt-4 text-base leading-7 text-slate-600">{data.body}</p>
        ) : null}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items?.map((item) => (
          <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">{item.title || 'Feature title'}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description || 'Add feature details from the page builder.'}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const ProductGridBlock = ({ data, linkedProducts }) => {
  const products = sortProductsByIds(linkedProducts, data.productIds || []);
  const gridClassName = PRODUCT_GRID_CLASS_MAP[data.columns] || PRODUCT_GRID_CLASS_MAP[3];

  return (
    <section className="bg-slate-50 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          {data.heading ? (
            <h2 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
              {data.heading}
            </h2>
          ) : null}
          {data.body ? (
            <p className="mt-4 text-base leading-7 text-slate-600">{data.body}</p>
          ) : null}
        </div>
        {products.length > 0 ? (
          <ProductsCardAll products={products} gridClassName={gridClassName} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No linked products are available for this block yet.
          </div>
        )}
      </div>
    </section>
  );
};

const CtaBlock = ({ data }) => {
  const toneClass = data.tone === 'light'
    ? 'bg-white border border-slate-200 text-slate-950'
    : data.tone === 'brand'
      ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 text-white'
      : 'bg-slate-950 text-white';

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`rounded-[32px] px-8 py-12 lg:px-12 ${toneClass}`}>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {data.heading}
            </h2>
            {data.body ? (
              <p className={`mt-4 text-base leading-7 ${data.tone === 'light' ? 'text-slate-600' : 'text-white/72'}`}>
                {data.body}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionButton href={data.primaryHref || getPagePath('products')} label={data.primaryLabel} />
              <ActionButton href={data.secondaryHref} label={data.secondaryLabel} secondary />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SpacerBlock = ({ data }) => {
  const heightClass = data.size === 'lg' ? 'h-20 lg:h-28' : data.size === 'sm' ? 'h-8 lg:h-10' : 'h-12 lg:h-16';
  return <div className={heightClass} aria-hidden="true" />;
};

const BLOCK_COMPONENTS = {
  hero: HeroBlock,
  richText: RichTextBlock,
  image: ImageBlock,
  featureList: FeatureListBlock,
  productGrid: ProductGridBlock,
  cta: CtaBlock,
  spacer: SpacerBlock,
};

const PageBuilderRenderer = ({ page, linkedProducts = [], renderBlockWrapper = null }) => {
  if (!page?.content?.length) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'var(--font-display)' }}>
            {page?.title || 'Untitled page'}
          </h1>
          <p className="mt-4 text-sm text-slate-500">This page does not have any published blocks yet.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-white">
      {page.content.map((block, index) => {
        const BlockComponent = BLOCK_COMPONENTS[block.type];
        if (!BlockComponent) {
          return null;
        }

        const blockNode = (
          <BlockComponent
            key={block.id}
            data={block.data || {}}
            page={page}
            linkedProducts={linkedProducts}
          />
        );

        if (typeof renderBlockWrapper === 'function') {
          return renderBlockWrapper({
            block,
            index,
            isLast: index === page.content.length - 1,
            totalBlocks: page.content.length,
            children: blockNode,
          });
        }

        return blockNode;
      })}
    </div>
  );
};

export default PageBuilderRenderer;
