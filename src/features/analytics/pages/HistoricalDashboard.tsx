/**
 * Historical Analytics Dashboard Page
 * Route: /inventory-insights/history
 *
 * Displays:
 * - Sticky header with filters
 * - Executive KPI cards
 * - Advanced charts (5 chart types)
 * - AI insight panel
 * - Historical data grid with export
 */

import { useEffect, useState } from 'react';
import { Filter, Calendar, BarChart3 } from 'lucide-react';
import { KPICard } from '../components/Analytics/KPICard';
import {
  RevenueTrendChart,
  ProfitTrendChart,
  ProductContributionChart,
  MarketplacePerformanceChart,
  TopProductsChart,
  MarginDistributionChart,
} from '../components/Analytics/Charts';
import { AIInsightPanel } from '../components/Analytics/AIInsightPanel';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsMetrics } from '../types/analytics';

export function HistoricalDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getMetrics(thirtyDaysAgo, today);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [thirtyDaysAgo, today]);

  if (loading || !metrics) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
          Inventory Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View comprehensive analytics and insights from your uploaded reports.
        </p>
      </div>

      {/* Sticky Controls */}
      <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-slate-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {thirtyDaysAgo} to {today}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <BarChart3 size={16} className="text-slate-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {metrics.productMetrics.length} products
            </span>
          </div>

          <div className="ml-auto">
            <button className="inline-flex items-center gap-2 rounded-lg bg-nexo-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
              <Filter size={16} />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Executive KPI Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Key Metrics
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KPICard
            label="Total Revenue"
            value={metrics.kpis.totalRevenue}
            format="currency"
            trend={12}
            color="blue"
          />
          <KPICard
            label="Gross Profit"
            value={metrics.kpis.grossProfit}
            format="currency"
            trend={8}
            color="green"
          />
          <KPICard
            label="Net Profit"
            value={metrics.kpis.netProfit}
            format="currency"
            trend={5}
            color="purple"
          />
          <KPICard
            label="Margin %"
            value={metrics.kpis.marginPercent}
            format="percent"
            color="orange"
          />
          <KPICard
            label="Inventory Value"
            value={metrics.kpis.inventoryValue}
            format="currency"
            color="blue"
          />
          <KPICard
            label="Dead Stock Value"
            value={metrics.kpis.deadStockValue}
            format="currency"
            trend={-12}
            color="red"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics Charts
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueTrendChart data={metrics.trends} />
          <ProfitTrendChart data={metrics.trends} />
          <MarketplacePerformanceChart data={metrics.marketplaceMetrics} />
          <TopProductsChart data={metrics.topProducts} />
          <ProductContributionChart data={metrics.productMetrics} />
          <MarginDistributionChart data={metrics.productMetrics} />
        </div>
      </div>

      {/* AI Insights & Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2" />
        <div>
          <AIInsightPanel insights={metrics.aiInsights} />
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Last updated: {new Date().toLocaleString('en-IN')} • Data from{' '}
        <span className="font-semibold">{metrics.dateRange.start}</span> to{' '}
        <span className="font-semibold">{metrics.dateRange.end}</span>
      </div>
    </div>
  );
}
