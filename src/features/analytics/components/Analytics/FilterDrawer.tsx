/**
 * FilterDrawer Component
 * Premium filter panel for analytics data
 * 
 * Features:
 * - Date range picker
 * - Marketplace multi-select
 * - Category filtering
 * - Profit range slider
 * - SKU search
 * - Save/reset presets
 * - Applied filter chips
 */

import { X, Sliders } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useAnalyticsStore } from '../../store/analyticsStore';
import type { AnalyticsFilter } from '../../types/analytics';
import type { Marketplace } from '../../types/reports';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: AnalyticsFilter) => void;
}

const MARKETPLACES: Marketplace[] = ['MEESHO', 'FLIPKART', 'AMAZON', 'OFFLINE'];

export function FilterDrawer({ isOpen, onClose, onApply }: FilterDrawerProps) {
  const filters = useAnalyticsStore((state) => state.filters);
  const setFilters = useAnalyticsStore((state) => state.setFilters);
  const resetFilters = useAnalyticsStore((state) => state.resetFilters);

  const [localFilters, setLocalFilters] = useState<AnalyticsFilter>(filters);
  const [profitRange, setProfitRange] = useState<[number, number]>([0, 100000]);

  const handleMarketplaceToggle = (marketplace: Marketplace) => {
    const updated = localFilters.marketplaces.includes(marketplace)
      ? localFilters.marketplaces.filter((m) => m !== marketplace)
      : [...localFilters.marketplaces, marketplace];
    setLocalFilters({ ...localFilters, marketplaces: updated });
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply?.(localFilters);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters(filters);
  };

  const appliedFilterCount =
    (localFilters.marketplaces.length < MARKETPLACES.length ? 1 : 0) +
    (localFilters.skuSearch ? 1 : 0) +
    (localFilters.minMargin ? 1 : 0) +
    (localFilters.categories?.length ? 1 : 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-40 h-full w-80 overflow-y-auto bg-white shadow-lg transition-transform dark:bg-slate-900',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={20} className="text-nexo-accent" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Filters
              </h2>
              {appliedFilterCount > 0 && (
                <span className="rounded-full bg-nexo-accent px-2 py-0.5 text-xs font-semibold text-white">
                  {appliedFilterCount}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Date Range
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400">From</label>
                <input
                  type="date"
                  value={localFilters.dateRange.start}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateRange: { ...localFilters.dateRange, start: e.target.value },
                    })
                  }
                  className={cn(
                    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                    'dark:border-slate-700 dark:bg-slate-800'
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400">To</label>
                <input
                  type="date"
                  value={localFilters.dateRange.end}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateRange: { ...localFilters.dateRange, end: e.target.value },
                    })
                  }
                  className={cn(
                    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                    'dark:border-slate-700 dark:bg-slate-800'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Marketplaces */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Marketplaces
            </label>
            <div className="space-y-2">
              {MARKETPLACES.map((marketplace) => (
                <label key={marketplace} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={localFilters.marketplaces.includes(marketplace)}
                    onChange={() => handleMarketplaceToggle(marketplace)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {marketplace}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Profit Range */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Profit Range
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={profitRange[0]}
                onChange={(e) => setProfitRange([Number(e.target.value), profitRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={profitRange[1]}
                onChange={(e) => setProfitRange([profitRange[0], Number(e.target.value)])}
                className="w-full"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 dark:text-slate-400">Min</label>
                  <input
                    type="number"
                    value={profitRange[0]}
                    onChange={(e) => setProfitRange([Number(e.target.value), profitRange[1]])}
                    className={cn(
                      'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                      'dark:border-slate-700 dark:bg-slate-800'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 dark:text-slate-400">Max</label>
                  <input
                    type="number"
                    value={profitRange[1]}
                    onChange={(e) => setProfitRange([profitRange[0], Number(e.target.value)])}
                    className={cn(
                      'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                      'dark:border-slate-700 dark:bg-slate-800'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Margin */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Minimum Margin %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={localFilters.minMargin ? Math.round(localFilters.minMargin * 100) : 0}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  minMargin: Number(e.target.value) / 100,
                })
              }
              className={cn(
                'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                'dark:border-slate-700 dark:bg-slate-800'
              )}
            />
          </div>

          {/* SKU Search */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              SKU Search
            </label>
            <input
              type="text"
              placeholder="Search by SKU..."
              value={localFilters.skuSearch || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, skuSearch: e.target.value })
              }
              className={cn(
                'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
                'dark:border-slate-700 dark:bg-slate-800'
              )}
            />
          </div>

          {/* Actions */}
          <div className="space-y-2 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              onClick={handleApply}
              className="w-full rounded-lg bg-nexo-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
