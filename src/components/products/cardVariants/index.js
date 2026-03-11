import {
  CompactProductCard,
  EditorialProductCard,
  SoftProductCard,
  SpotlightProductCard,
} from './ProductCardSetA';
import {
  GalleryProductCard,
  GlassProductCard,
  OutlineProductCard,
  SplitProductCard,
} from './ProductCardSetB';
import {
  BannerProductCard,
  LuxeProductCard,
  MinimalCardProductCard,
  StackedProductCard,
} from './ProductCardSetC';
import ProductListCard from './ProductListCard';

export const PRODUCT_CARD_COMPONENTS = {
  editorial: EditorialProductCard,
  spotlight: SpotlightProductCard,
  compact: CompactProductCard,
  soft: SoftProductCard,
  glass: GlassProductCard,
  gallery: GalleryProductCard,
  outline: OutlineProductCard,
  split: SplitProductCard,
  stacked: StackedProductCard,
  luxe: LuxeProductCard,
  'minimal-card': MinimalCardProductCard,
  banner: BannerProductCard,
};

export { ProductListCard };
