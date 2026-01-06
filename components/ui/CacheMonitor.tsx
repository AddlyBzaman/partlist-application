import React, { useState, useEffect } from 'react';
import { productCache, bahanCache, searchCache } from '@/lib/cache/CacheService';

interface CacheStats {
  product: { size: number; keys: string[] };
  bahan: { size: number; keys: string[] };
  search: { size: number; keys: string[] };
}

export function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats>({
    product: { size: 0, keys: [] },
    bahan: { size: 0, keys: [] },
    search: { size: 0, keys: [] }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats({
        product: productCache.getStats(),
        bahan: bahanCache.getStats(),
        search: searchCache.getStats()
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = (type: 'product' | 'bahan' | 'search' | 'all') => {
    if (type === 'product') {
      productCache.clear();
    } else if (type === 'bahan') {
      bahanCache.clear();
    } else if (type === 'search') {
      searchCache.clear();
    } else if (type === 'all') {
      productCache.clear();
      bahanCache.clear();
      searchCache.clear();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg z-50"
        title="Cache Monitor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12z"/>
          <path d="M3 14h.01"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Cache Monitor</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Product Cache */}
        <div className="border border-gray-200 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">Product Cache</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {stats.product.size} items
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleClearCache('product')}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Bahan Cache */}
        <div className="border border-gray-200 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">Bahan Cache</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {stats.bahan.size} items
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleClearCache('bahan')}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search Cache */}
        <div className="border border-gray-200 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">Search Cache</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {stats.search.size} items
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleClearCache('search')}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Clear All */}
        <button
          onClick={() => handleClearCache('all')}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
        >
          Clear All Cache
        </button>
      </div>
    </div>
  );
}
