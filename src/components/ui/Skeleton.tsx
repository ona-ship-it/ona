import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = false 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${width} ${height} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
};

export const GiveawayCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-4">
      {/* Image skeleton */}
      <Skeleton height="h-48" className="mb-4" />
      
      {/* Title skeleton */}
      <Skeleton height="h-6" width="w-3/4" className="mb-2" />
      
      {/* Description skeleton */}
      <Skeleton height="h-4" width="w-full" className="mb-1" />
      <Skeleton height="h-4" width="w-2/3" className="mb-4" />
      
      {/* Prize and entries skeleton */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton height="h-5" width="w-20" />
        <Skeleton height="h-5" width="w-24" />
      </div>
      
      {/* Button skeleton */}
      <Skeleton height="h-10" className="rounded-lg" />
    </div>
  );
};

export const SearchFilterSkeleton: React.FC = () => {
  return (
    <div className="mb-8">
      {/* Search bar skeleton */}
      <div className="flex gap-4 mb-4">
        <Skeleton height="h-12" width="flex-1" className="rounded-lg" />
        <Skeleton height="h-12" width="w-12" className="rounded-lg" />
      </div>
      
      {/* Filter chips skeleton */}
      <div className="flex gap-2 flex-wrap">
        <Skeleton height="h-8" width="w-20" className="rounded-full" />
        <Skeleton height="h-8" width="w-24" className="rounded-full" />
        <Skeleton height="h-8" width="w-16" className="rounded-full" />
        <Skeleton height="h-8" width="w-28" className="rounded-full" />
      </div>
    </div>
  );
};