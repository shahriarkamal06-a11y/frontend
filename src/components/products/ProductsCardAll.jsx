import { PRODUCT_CARD_COMPONENTS, ProductListCard } from './cardVariants';
import { useStoreSettingsStore } from '../../store';
import { cn } from '../../utils';
import {
  getProductGridClassName,
  resolveProductCardVariant,
  resolveProductLayout,
} from '../../utils/themeHelpers';

const DEFAULT_MASONRY_CLASS_NAME = 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 lg:gap-6';
const GRID_CARD_WRAPPER_CLASS_NAME = 'w-full min-w-0';

const ProductsCardAll = ({
  products = [],
  viewMode,
  gridClassName,
  masonryClassName = DEFAULT_MASONRY_CLASS_NAME,
  productCardVariant,
}) => {
  const theme = useStoreSettingsStore((state) => state.theme);
  const effectiveLayout = resolveProductLayout(viewMode || theme?.layoutType);
  const effectiveVariant = resolveProductCardVariant(productCardVariant || theme?.productCardVariant);
  const CardComponent = PRODUCT_CARD_COMPONENTS[effectiveVariant] || PRODUCT_CARD_COMPONENTS.editorial;
  const computedGridClassName = getProductGridClassName(theme);

  if (effectiveLayout === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductListCard key={product.id} product={product} theme={theme} />
        ))}
      </div>
    );
  }

  if (effectiveLayout === 'masonry') {
    return (
      <div className={masonryClassName || DEFAULT_MASONRY_CLASS_NAME}>
        {products.map((product) => (
          <div key={product.id} className="mb-4 break-inside-avoid lg:mb-6">
            <CardComponent product={product} theme={theme} className="h-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid', computedGridClassName, gridClassName)}>
      {products.map((product) => (
        <div key={product.id} className={GRID_CARD_WRAPPER_CLASS_NAME}>
          <CardComponent product={product} theme={theme} className="h-full" />
        </div>
      ))}
    </div>
  );
};

export default ProductsCardAll;
