/**
 * Export Options Component
 * Provides export functionality for analytics data
 * 
 * Features:
 * - CSV export
 * - Excel export
 * - Include filters in filename
 * - Download trigger
 * - Success/error feedback
 */

import { Download, FileText, Sheet } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { analyticsService } from '../../services/analyticsService';

interface ExportOptionsProps {
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function ExportOptions({ onExportStart, onExportComplete }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const filters = useAnalyticsStore((state) => state.filters);

  const generateFilename = (format: 'csv' | 'excel'): string => {
    const date = new Date().toISOString().split('T')[0];
    const formatExt = format === 'csv' ? 'csv' : 'xlsx';
    const parts: string[] = [
      'analytics-export',
      date,
      ...filters.marketplaces.map((m) => m.toLowerCase()),
    ];

    if (filters.skuSearch) {
      parts.push(filters.skuSearch.replace(/\s+/g, '-'));
    }

    return `${parts.join('-')}.${formatExt}`;
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true);
    onExportStart?.();

    try {
      const blob = await analyticsService.exportData(format);
      const filename = generateFilename(format);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      onExportComplete?.();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
          'border border-slate-200 text-slate-700',
          'hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed',
          'dark:border-slate-700 dark:text-white dark:hover:bg-slate-800'
        )}
      >
        <Download size={16} />
        Export
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg',
            'dark:border-slate-700 dark:bg-slate-900'
          )}
        >
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition',
              'hover:bg-slate-50 disabled:opacity-50',
              'dark:hover:bg-slate-800'
            )}
          >
            <FileText size={16} className="text-blue-600" />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Export as CSV</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Comma-separated values
              </div>
            </div>
          </button>

          <div className="border-t border-slate-200 dark:border-slate-700" />

          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition',
              'hover:bg-slate-50 disabled:opacity-50',
              'dark:hover:bg-slate-800'
            )}
          >
            <Sheet size={16} className="text-green-600" />
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Export as Excel</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Microsoft Excel</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
