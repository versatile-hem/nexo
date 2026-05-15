/**
 * ValidationPreviewTable Component
 * Shows first 10 rows from uploaded file with validation status
 * 
 * Features:
 * - Sticky header
 * - Status badges (Valid, Updated, Duplicate, Failed)
 * - Expandable rows for error details
 * - Smooth row hover
 */

import { ChevronDown, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import type { ProductAnalyticsRecord } from '../../types/reports';

interface ValidationPreviewTableProps {
  records: ProductAnalyticsRecord[];
}

const statusConfig = {
  valid: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    label: 'Valid',
  },
  updated: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: AlertTriangle,
    label: 'Updated',
  },
  duplicate: {
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertTriangle,
    label: 'Duplicate',
  },
  failed: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    label: 'Failed',
  },
};

export function ValidationPreviewTable({ records }: ValidationPreviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const previewRecords = records.slice(0, 10);
  const hasErrors = records.some((r) => r.validationErrors && r.validationErrors.length > 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                SKU
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                Product
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                Revenue
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                Expense
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                Qty
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                Marketplace
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                Status
              </th>
              {hasErrors && (
                <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                  Details
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewRecords.map((record, index) => {
              const isExpanded = expandedRows.has(index);
              const config = statusConfig[record.status];
              const StatusIcon = config.icon;

              return (
                <tr
                  key={index}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {record.sku}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {record.productName}
                      </p>
                      {record.category && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {record.category}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                    ₹{record.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    ₹{record.expense.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                    {record.quantity}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {record.marketplace}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                        config.badge
                      )}
                    >
                      <StatusIcon size={14} />
                      {config.label}
                    </span>
                  </td>
                  {hasErrors && (
                    <td className="px-4 py-3 text-center">
                      {record.validationErrors && record.validationErrors.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <ChevronDown
                            size={16}
                            className={cn('transition-transform', isExpanded && 'rotate-180')}
                          />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewRecords.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          Showing first {previewRecords.length} of {records.length} records
        </div>
      )}
    </div>
  );
}
