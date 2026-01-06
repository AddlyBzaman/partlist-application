import React from 'react';

export function SkeletonLoading({ 
  count = 1, 
  className = '', 
  height = 'h-4' 
}: {
  count?: number;
  className?: string;
  height?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded animate-pulse`}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header Skeleton */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-6 bg-gray-300 rounded animate-pulse" />
        ))}
      </div>
      
      {/* Row Skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-3" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InputSkeleton() {
  return (
    <div className="h-10 bg-gray-200 rounded animate-pulse" />
  );
}

export function ButtonSkeleton() {
  return (
    <div className="h-10 w-24 bg-gray-300 rounded animate-pulse" />
  );
}
