'use client';

interface PageSkeletonProps {
  variant?: 'orders' | 'table' | 'generic' | 'report';
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-4 w-96" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>

      {/* Search */}
      <SkeletonBlock className="h-12 w-full rounded-xl" />

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex justify-between">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-80" />
        </div>
        <SkeletonBlock className="h-10 w-32 rounded-xl" />
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-10 w-24 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3"
          >
            <SkeletonBlock className="h-5 w-16" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-10 w-24 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="w-10 h-10 rounded-xl" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
            <SkeletonBlock className="h-8 w-32" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <SkeletonBlock className="h-6 w-48 mb-4" />
        <SkeletonBlock className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-80" />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
        <SkeletonBlock className="h-6 w-40" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/2" />
            </div>
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageSkeleton({ variant = 'generic' }: PageSkeletonProps) {
  switch (variant) {
    case 'orders':
      return <OrdersSkeleton />;
    case 'table':
      return <TableSkeleton />;
    case 'report':
      return <ReportSkeleton />;
    default:
      return <GenericSkeleton />;
  }
}
