/**
 * Upload Workflow Page
 * Route: /inventory-insights/upload
 * 
 * Displays:
 * - Hero section
 * - Drag-drop upload zone
 * - Validation preview table
 * - Insight summary cards
 * - Upload timeline
 */

import { useState } from 'react';
import { DragDropZone } from '../components/Upload/DragDropZone';
import { ValidationPreviewTable } from '../components/Upload/ValidationPreviewTable';
import { InsightSummaryCards } from '../components/Upload/InsightSummaryCards';
import { UploadTimeline } from '../components/Upload/UploadTimeline';
import type { AnalyticsReport } from '../types/reports';

export function UploadWorkflow() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);

  const handleUploadComplete = (uploadedReport: AnalyticsReport) => {
    setReport(uploadedReport);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexo-accent/10 to-blue-50 p-12 dark:from-nexo-accent/5 dark:to-blue-950/20">
        <div className="relative z-10">
          <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
            Inventory Insights Engine
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Upload your inventory reports and automatically generate profitability insights, 
            analytics, and historical intelligence to power your business decisions.
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10">
          <svg className="h-64 w-64" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" />
            <path d="M60,100 L100,60 L140,100" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Start Uploading
        </h2>
        <DragDropZone onUploadComplete={handleUploadComplete} />
      </div>

      {/* Report Details */}
      {report && (
        <div className="space-y-8">
          {/* Insight Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Quick Insights
            </h2>
            <InsightSummaryCards summary={report.summary} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Validation Table - 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Data Preview
              </h2>
              <ValidationPreviewTable records={report.records} />
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                <p>
                  ✓ <strong>{report.summary.validRecords}</strong> valid records •
                  🔄 <strong>{report.summary.updatedRecords}</strong> updated •
                  ⚠️ <strong>{report.summary.duplicateRecords}</strong> duplicates
                </p>
              </div>
            </div>

            {/* Timeline - 1 column */}
            <div>
              <UploadTimeline report={report} />
            </div>
          </div>

          {/* Channel Breakdown */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Channel Breakdown
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {report.summary.channelBreakdown.map((channel) => (
                <div
                  key={channel.marketplace}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {channel.marketplace}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        ₹{(channel.revenue / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Profit:</span>
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                        ₹{(channel.profit / 1000).toFixed(1)}K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Margin:</span>
                      <span className="font-mono font-semibold text-nexo-accent">
                        {(channel.margin * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Products:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {channel.productCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
