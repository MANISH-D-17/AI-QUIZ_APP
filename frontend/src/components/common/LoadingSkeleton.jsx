import React from 'react';

/**
 * Animated gray skeleton loader with shimmer effects
 */
export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const renderSkeleton = (index) => {
    if (type === 'card') {
      return (
        <div 
          key={index}
          className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[280px]"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-10" />

          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-24 bg-surface-2 rounded-full" />
            <div className="h-6 w-16 bg-surface-2 rounded-full" />
          </div>

          <div className="h-7 w-3/4 bg-surface-2 rounded-lg mb-3" />
          <div className="h-4 w-full bg-surface-2 rounded mb-2" />
          <div className="h-4 w-5/6 bg-surface-2 rounded mb-6" />

          <div className="mt-auto flex items-center justify-between">
            <div className="flex space-x-3">
              <div className="h-4 w-16 bg-surface-2 rounded" />
              <div className="h-4 w-12 bg-surface-2 rounded" />
            </div>
            <div className="h-10 w-28 bg-surface-2 rounded-xl" />
          </div>
        </div>
      );
    }

    if (type === 'list') {
      return (
        <div key={index} className="relative overflow-hidden bg-surface border border-border p-4 rounded-xl flex items-center space-x-4 mb-3">
          <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-10" />
          <div className="h-10 w-10 bg-surface-2 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 bg-surface-2 rounded" />
            <div className="h-4 w-1/2 bg-surface-2 rounded" />
          </div>
          <div className="h-6 w-12 bg-surface-2 rounded" />
        </div>
      );
    }

    if (type === 'circle') {
      return (
        <div key={index} className="relative overflow-hidden bg-surface-2 rounded-full h-24 w-24 flex items-center justify-center">
          <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-10" />
        </div>
      );
    }

    return (
      <div key={index} className="relative overflow-hidden bg-surface-2 rounded h-4 w-full mb-2">
        <div className="absolute inset-0 shimmer-bg animate-shimmer opacity-10" />
      </div>
    );
  };

  if (count > 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
      </div>
    );
  }

  return renderSkeleton(0);
}
