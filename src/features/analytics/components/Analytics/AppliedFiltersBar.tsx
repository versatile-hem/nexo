/**
 * Applied Filters Bar Component
 * Displays currently applied filters as dismissible chips
 * 
 * Features:
 * - Filter chips with values
 * - Dismiss individual filters
 * - Clear all filters option
 * - Compact layout that wraps
 */

import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAnalyticsStore } from '../../store/analyticsStore';
import type { Marketplace } from '../../types/reports';

export function AppliedFiltersBar() {
  const filters = useAnalyticsStore((state) => state.filters);
  const setFilters = useAnalyticsStore((state) => state.setFilters);
  const resetFilters = useAnalyticsStore((state) => state.resetFilters);

  const hasActiveFilters =
    filters.marketplaces.length < 4 ||
    filters.skuSearch ||
    filters.minMargin ||
    filters.categories?.length;

  if (!hasActiveFilters) {
    return null;
  }

  const handleRemoveMarketplace = (marketplace: Marketplace) => {
    setFilters({
      ...filters,
      marketplaces: filters.marketplaces.filter((m) => m !== marketplace),
    });
  };

  const handleRemoveMinMargin = () => {
    setFilters({ ...filters, minMargin: undefined });
  };

  const handleRemoveSKU = () => {
    setFilters({ ...filters, skuSearch: '' });
  };

  const handleRemoveCategories = () => {
    setFilters({ ...filters, categories: [] });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Filters:</span>

      {/* Marketplace filters */}
      {filters.marketplaces.length < 4 && (
        <div className="flex flex-wrap gap-2">
          {filters.marketplaces.map((marketplace) => (
            <div
              key={marketplace}
              className={cn(
                'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium',
                'border border-blue-200 text-blue-700',
                'dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300'
              )}
            >
              {marketplace}
              <button
                onClick={() => handleRemoveMarketplace(marketplace)}
                className="ml-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Min Margin filter */}
      {filters.minMargin && (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium',
            'border border-green-200 text-green-700',
            'dark:border-green-700 dark:bg-green-900 dark:text-green-300'
          )}
        >
          Margin ≥ {Math.round(filters.minMargin * 100)}%
          <button
            onClick={handleRemoveMinMargin}
            className="ml-1 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* SKU Search filter */}
      {filters.skuSearch && (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium',
            'border border-purple-200 text-purple-700',
            'dark:border-purple-700 dark:bg-purple-900 dark:text-purple-300'
          )}
        >
          SKU: {filters.skuSearch}
          <button
            onClick={handleRemoveSKU}
            className="ml-1 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Categories filter */}
      {filters.categories && filters.categories.length > 0 && (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium',
            'border border-orange-200 text-orange-700',
            'dark:border-orange-700 dark:bg-orange-900 dark:text-orange-300'
          )}
        >
          {filters.categories.length} Categories
          <button
            onClick={handleRemoveCategories}
            className="ml-1 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Clear All button */}
      <button
        onClick={resetFilters}
        className={cn(
          'ml-auto text-xs font-medium text-slate-600 hover:text-slate-900',
          'dark:text-slate-400 dark:hover:text-slate-200'
        )}
      >
        Clear All
      </button>
    </div>
  );
}
