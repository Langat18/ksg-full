import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 6 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-ksg-card animate-pulse">
            <div className="skeleton-ksg h-48 w-full mb-4 rounded-lg"></div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 mb-4">
                <div className="skeleton-ksg h-10 w-10 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton-ksg h-4 w-3/4"></div>
                  <div className="skeleton-ksg h-3 w-1/2"></div>
                </div>
              </div>
              <div className="skeleton-ksg h-5 w-full"></div>
              <div className="skeleton-ksg h-4 w-full"></div>
              <div className="skeleton-ksg h-4 w-2/3"></div>
              <div className="flex space-x-4 pt-2">
                <div className="skeleton-ksg h-3 w-1/4"></div>
                <div className="skeleton-ksg h-3 w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'featured') {
    return (
      <div className="animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="skeleton-ksg h-64 md:h-96 rounded-lg"></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="skeleton-ksg h-4 w-1/4"></div>
              <div className="skeleton-ksg h-6 w-3/4"></div>
            </div>
            <div className="space-y-3">
              <div className="skeleton-ksg h-4 w-full"></div>
              <div className="skeleton-ksg h-4 w-full"></div>
              <div className="skeleton-ksg h-4 w-2/3"></div>
            </div>
            <div className="space-y-2">
              <div className="skeleton-ksg h-3 w-1/3"></div>
              <div className="skeleton-ksg h-3 w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg">
              <div className="skeleton-ksg h-12 w-12 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton-ksg h-4 w-1/3"></div>
                <div className="skeleton-ksg h-3 w-1/2"></div>
              </div>
              <div className="skeleton-ksg h-4 w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow-sm">
            <div className="skeleton-ksg h-8 w-full mb-2"></div>
            <div className="skeleton-ksg h-4 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="skeleton-ksg h-8 w-1/3 mb-2"></div>
          <div className="skeleton-ksg h-4 w-1/2"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow-sm">
              <div className="skeleton-ksg h-8 w-full mb-2"></div>
              <div className="skeleton-ksg h-4 w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="skeleton-ksg h-6 w-3/4"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="skeleton-ksg h-4 w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
