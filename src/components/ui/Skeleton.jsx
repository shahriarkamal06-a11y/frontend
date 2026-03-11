// Skeleton Components for Loading States
import { cn } from '../../utils';

export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('animate-pulse bg-slate-200 rounded', className)}
    {...props}
  />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="aspect-square bg-slate-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-white animate-fade-in">
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-12 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CartSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-4">
              <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-4 border-t">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const OrdersSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="flex gap-4">
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} className="w-20 h-20 rounded-lg" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="p-4 border-b border-slate-200 bg-slate-50">
      <div className="flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-slate-100">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          {[...Array(columns)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <div className="flex items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

export const SearchResultsSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="bg-white border-b border-slate-200 p-8">
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex gap-6">
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
