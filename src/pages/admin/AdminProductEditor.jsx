import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ShopifyProductForm from '../../components/admin/ShopifyProductForm';
import { productAPI } from '../../services/api';
import { useProductData } from '../../hooks/useProductData';

const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

const toNumberOrNull = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const cleanObject = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const parseVariantAttributes = (value) => {
  if (!value || typeof value !== 'string') return {};

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [rawKey, ...rawValueParts] = entry.split(':');
      const key = rawKey?.trim();
      const rawValue = rawValueParts.join(':').trim();

      if (!key || !rawValue) return acc;
      acc[key.toLowerCase()] = rawValue;
      return acc;
    }, {});
};

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first?.message === 'string') return first.message;
  }
  return fallback;
};

const normalizeProductType = (value, isDigital) => {
  if (value === 'SIMPLE' || value === 'VARIABLE' || value === 'DIGITAL') return value;
  return isDigital ? 'DIGITAL' : 'SIMPLE';
};

const AdminProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { product, categories, isLoading } = useProductData(id);

  const handleSave = async (productData) => {
    const normalizedPrice = toNumberOrUndefined(productData.price);
    const normalizedCompareAtPrice = toNumberOrNull(productData.compareAtPrice);
    const effectiveCompareAtPrice =
      normalizedPrice !== undefined &&
      normalizedCompareAtPrice !== undefined &&
      normalizedCompareAtPrice !== null &&
      normalizedCompareAtPrice > normalizedPrice
        ? normalizedCompareAtPrice
        : null;

    const computedIsDigital =
      productData.physicalProduct !== undefined ? !productData.physicalProduct : !!productData.isDigital;
    const normalizedDimensions = {
      length: toNumberOrUndefined(productData?.dimensions?.length),
      width: toNumberOrUndefined(productData?.dimensions?.width),
      height: toNumberOrUndefined(productData?.dimensions?.height),
    };
    const hasDimensions =
      normalizedDimensions.length !== undefined ||
      normalizedDimensions.width !== undefined ||
      normalizedDimensions.height !== undefined;

    const payload = cleanObject({
      name: productData.name?.trim(),
      slug: productData.slug || undefined,
      description: productData.description || undefined,
      features: productData.features || undefined,
      shortDescription: productData.shortDescription || undefined,
      price: normalizedPrice,
      compareAtPrice: effectiveCompareAtPrice,
      costPrice: toNumberOrNull(productData.costPrice ?? productData.costPerItem),
      sku: productData.sku || undefined,
      barcode: productData.barcode || undefined,
      categoryId: productData.categoryId || null,
      section: productData.section || null,
      quantity: toNumberOrUndefined(productData.quantity),
      lowStockThreshold: toNumberOrUndefined(productData.lowStockThreshold),
      weight: toNumberOrNull(productData.weight),
      isActive: productData.status ? productData.status === 'active' : productData.isActive,
      isDigital: computedIsDigital,
      digitalUrl: productData.digitalUrl || undefined,
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      type: normalizeProductType(productData.type, computedIsDigital),
      dimensions: hasDimensions ? cleanObject(normalizedDimensions) : undefined,
      attributes: productData.attributes || {},
      customFields: {
        vendor: productData.vendor,
        trackQuantity: productData.trackQuantity,
        continueSellingWhenOutOfStock: productData.continueSellingWhenOutOfStock,
        visibility: productData.visibility,
      },
      seo: productData.seo || undefined,
      images: Array.isArray(productData.images)
        ? productData.images
            .map((image) => (typeof image === 'string' ? image : image?.url))
            .filter(Boolean)
        : undefined,
      variants: Array.isArray(productData.variants)
        ? productData.variants
            .map((variant, index) => ({
              id: variant.id || undefined,
              name: variant.name?.trim(),
              sku: variant.sku?.trim() || undefined,
              price: toNumberOrUndefined(variant.price) ?? normalizedPrice ?? 0,
              compareAtPrice: toNumberOrNull(variant.compareAtPrice),
              quantity: toNumberOrUndefined(variant.quantity) ?? 0,
              attributes: parseVariantAttributes(variant.optionValues),
              imageUrl: variant.imageUrl?.trim() || undefined,
              weight: toNumberOrNull(variant.weight),
              isActive: variant.isActive !== false,
              sortOrder: index,
            }))
            .filter((variant) => variant.name)
        : undefined,
      bulkPricing: Array.isArray(productData.bulkPricing)
        ? productData.bulkPricing
            .map((rule) => ({
              id: rule.id || undefined,
              minQty: toNumberOrUndefined(rule.minQty),
              maxQty: toNumberOrNull(rule.maxQty),
              price: toNumberOrUndefined(rule.price),
            }))
            .filter((rule) => rule.minQty && rule.price !== undefined)
        : undefined,
    });

    try {
      if (id) {
        await productAPI.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await productAPI.createProduct(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save product'));
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <ShopifyProductForm
        product={product}
        categories={categories}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AdminProductEditor;
