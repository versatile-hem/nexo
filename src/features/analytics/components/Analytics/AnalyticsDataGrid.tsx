/**
 * AnalyticsDataGrid Component
 * Premium analytics data table with advanced features
 * 
 * Features:
 * - Sticky header + column pinning (SKU)
 * - Multiple sorting
 * - Row selection
 * - Expandable rows
 * - Global search
 * - Pagination controls
 * - Responsive design
 */

import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import type { AnalyticsDataGridRow } from '../../types/analytics';

interface AnalyticsDataGridProps {
  data: AnalyticsDataGridRow[];
  isLoading?: boolean;
  onRowSelect?: (rows: string[]) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = keyof AnalyticsDataGridRow | null;

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function AnalyticsDataGrid({
  data,
  isLoading,
  onRowSelect,
  currentPage = 0,
  totalPages = 1,
  onPageChange,
}: AnalyticsDataGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'recordDate',
    direction: 'desc',
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (row) =>
        row.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field as keyof AnalyticsDataGridRow];
      const bValue = b[sortConfig.field as keyof AnalyticsDataGridRow];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig]);

  const handleSort = (field: SortField) => {
    if (sortConfig.field === field) {
      const nextDirection =
        sortConfig.direction === 'asc' ? 'desc' : sortConfig.direction === 'desc' ? null : 'asc';
      setSortConfig({
        field: nextDirection ? field : null,
        direction: nextDirection,
      });
    } else {
      setSortConfig({ field, direction: 'asc' });
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedRows(allIds);
      onRowSelect?.(Array.from(allIds));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onRowSelect?.(Array.from(newSelected));
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field)
      return <div className="h-4 w-4 text-slate-300 dark:text-slate-600" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={16} className="text-nexo-accent" />
    ) : (
      <ChevronDown size={16} className="text-nexo-accent" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search SKU or product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm',
            'transition placeholder:text-slate-400',
            'dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500'
          )}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="sticky left-0 z-20 w-12 bg-white px-4 py-3 text-left dark:bg-slate-900">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </label>
              </th>

              <th className="sticky left-12 z-20 bg-white px-4 py-3 text-left font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
                <button
                  onClick={() => handleSort('sku')}
                  className="flex items-center gap-2 transition hover:text-nexo-accent"
                >
                  SKU
                  <SortIcon field="sku" />
                </button>
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                <button
                  onClick={() => handleSort('productName')}
                  className="flex items-center gap-2 transition hover:text-nexo-accent"
                >
                  Product
                  <SortIcon field="productName" />
                </button>
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                <button
                  onClick={() => handleSort('marketplace')}
                  className="flex items-center gap-2 transition hover:text-nexo-accent"
                >
                  Marketplace
                  <SortIcon field="marketplace" />
                </button>
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                <button
                  onClick={() => handleSort('revenue')}
                  className="flex items-center justify-end gap-2 transition hover:text-nexo-accent"
                >
                  Revenue
                  <SortIcon field="revenue" />
                </button>
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                <button
                  onClick={() => handleSort('netProfit')}
                  className="flex items-center justify-end gap-2 transition hover:text-nexo-accent"
                >
                  Profit
                  <SortIcon field="netProfit" />
                </button>
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                <button
                  onClick={() => handleSort('margin')}
                  className="flex items-center justify-end gap-2 transition hover:text-nexo-accent"
                >
                  Margin %
                  <SortIcon field="margin" />
                </button>
              </th>

              <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                Qty
              </th>

              <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white" />
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row) => {
              const isSelected = selectedRows.has(row.id);
              const isExpanded = expandedRows.has(row.id);
              const marginPercent = Math.round(row.margin * 100);

              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-slate-100 transition',
                    'hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50',
                    isSelected && 'bg-nexo-accent/5'
                  )}
                >
                  <td className="sticky left-0 z-10 w-12 bg-inherit px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRow(row.id)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>

                  <td className="sticky left-12 z-10 bg-inherit px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {row.sku}
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {row.productName}
                      </p>
                      {row.category && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {row.category}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {row.marketplace}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{row.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-semibold text-green-600 dark:text-green-400">
                    ₹{row.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>

                  <td
                    className={cn(
                      'px-4 py-3 text-right font-mono font-semibold',
                      marginPercent >= 20
                        ? 'text-green-600 dark:text-green-400'
                        : marginPercent >= 10
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {marginPercent}%
                  </td>

                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                    {row.quantity}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleExpand(row.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <ChevronDown
                        size={16}
                        className={cn('transition-transform', isExpanded && 'rotate-180')}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-semibold">{sortedData.length}</span> of{' '}
          <span className="font-semibold">{data.length}</span> records
          {selectedRows.size > 0 && (
            <>
              {' '}
              • <span className="font-semibold">{selectedRows.size}</span> selected
            </>
          )}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 0}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="rounded px-3 py-1 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="rounded px-3 py-1 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
