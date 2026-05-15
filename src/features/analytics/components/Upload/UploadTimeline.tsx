/**
 * UploadTimeline Component
 * Shows activity timeline of upload process
 * 
 * Displays:
 * - File uploaded
 * - Validation completed
 * - Duplicate rows updated
 * - Profitability generated
 * - Analytics saved
 * 
 * Features:
 * - Pulsing active step indicator
 * - Timeline visualization
 * - Status labels
 */

import type { AnalyticsReport } from '../../types/reports';

interface TimelineEvent {
  label: string;
  description: string;
  icon: string;
  timestamp?: string;
}

interface UploadTimelineProps {
  report: AnalyticsReport;
}

export function UploadTimeline({ report }: UploadTimelineProps) {
  const uploadDate = new Date(report.uploadedAt);
  const formatTime = (date: Date, offsetSeconds: number = 0) => {
    const d = new Date(date.getTime() + offsetSeconds * 1000);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const events: TimelineEvent[] = [
    {
      label: 'File Uploaded',
      description: `${report.fileName} • ${(report.validationStats.totalRows).toLocaleString()} rows`,
      icon: '📤',
      timestamp: formatTime(uploadDate),
    },
    {
      label: 'Validation Completed',
      description: `${report.validationStats.validRows} valid • ${report.validationStats.duplicateRows} duplicates • ${report.validationStats.errorRows} errors`,
      icon: '✓',
      timestamp: formatTime(uploadDate, 1),
    },
    {
      label: 'Duplicate Rows Updated',
      description: `${report.summary.duplicateRecords} duplicates processed`,
      icon: '🔄',
      timestamp: formatTime(uploadDate, 2),
    },
    {
      label: 'Profitability Generated',
      description: `₹${(report.summary.totalProfit / 1000).toFixed(1)}K profit calculated`,
      icon: '📊',
      timestamp: formatTime(uploadDate, 3),
    },
    {
      label: 'Analytics Saved',
      description: 'Report ready for analysis',
      icon: '💾',
      timestamp: formatTime(uploadDate, 4),
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Upload Activity
      </h3>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline line */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                  index === events.length - 1
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                {index === events.length - 1 ? (
                  '✓'
                ) : (
                  <span className="animate-pulse">{event.icon}</span>
                )}
              </div>
              {index < events.length - 1 && (
                <div className="mt-2 h-12 w-1 bg-gradient-to-b from-blue-200 to-blue-100 dark:from-blue-900 dark:to-blue-800" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-4 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {event.label}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {event.timestamp}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <strong>Upload ID:</strong> {report.id}
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          <strong>Uploaded By:</strong> {report.uploadedBy}
        </p>
      </div>
    </div>
  );
}
