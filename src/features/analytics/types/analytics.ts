/**
 * Analytics and Metrics Types
 * Represents aggregated dashboard data
 */

import type { Marketplace, ChannelMetrics } from './reports';

export interface AnalyticsMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  dateRange: {
    start: string;
    end: string;
  };
  kpis: KPI;
  trends: TrendData[];
  productMetrics: ProductMetrics[];
  marketplaceMetrics: ChannelMetrics[];
  topProducts: ProductMetrics[];
  aiInsights: AIInsight[];
}

export interface KPI {
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  marginPercent: number;
  inventoryValue: number;
  deadStockValue: number;
}

export interface TrendData {
  date: string;
  revenue: number;
  profit: number;
  margin: number;
}

export interface ProductMetrics {
  sku: string;
  productName: string;
  revenue: number;
  profit: number;
  margin: number;
  quantity: number;
  daysInStock?: number;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'insight';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction?: string;
  metric?: string;
  value?: string | number;
}

export interface AnalyticsFilter {
  dateRange: {
    start: string;
    end: string;
  };
  marketplaces: Marketplace[];
  categories?: string[];
  profitRange?: [number, number];
  skuSearch?: string;
  minMargin?: number;
}

export interface AnalyticsDataGridRow {
  id: string;
  reportId: string;
  sku: string;
  productName: string;
  category: string;
  marketplace: Marketplace;
  revenue: number;
  cogs: number;
  expense: number;
  quantity: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
  recordDate: string;
  daysInStock?: number;
  status: 'valid' | 'updated' | 'duplicate' | 'failed';
}

export interface AnalyticsDataGridResponse {
  data: AnalyticsDataGridRow[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
  aggregates: {
    totalRevenue: number;
    totalProfit: number;
    averageMargin: number;
    recordsCount: number;
  };
}

export interface InsightsResponse {
  insights: AIInsight[];
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  startDate?: string;
  endDate?: string;
  marketplaces?: Marketplace[];
  includeColumns?: string[];
}
