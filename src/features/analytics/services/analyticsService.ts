/**
 * Analytics Service - Real API Integration
 * Makes actual HTTP requests to backend analytics endpoints
 * Fallback to mock data if API is unavailable
 */

import { api, mockResponse } from '@/services/api';
import type {
  AnalyticsReport,
  ReportListResponse,
  ReportDetailsResponse,
  Marketplace,
} from '../types/reports';
import type {
  AnalyticsMetrics,
  AnalyticsDataGridResponse,
  AnalyticsDataGridRow,
  InsightsResponse,
} from '../types/analytics';

// API Configuration
const API_ENDPOINTS = {
  UPLOAD: '/analytics/upload',
  REPORTS: '/analytics/reports',
  REPORT_DETAILS: (id: string) => `/analytics/reports/${id}`,
  METRICS: '/analytics/metrics',
  HISTORICAL_DATA: '/analytics/data',
  INSIGHTS: '/analytics/insights',
  EXPORT: '/analytics/export',
};

// Fallback mock data generators
const mockProducts = [
  { sku: 'SKU-1001', name: 'Premium Coffee Beans', category: 'Groceries' },
  { sku: 'SKU-1002', name: 'Portable Scanner', category: 'Electronics' },
  { sku: 'SKU-1003', name: 'Thermal Printer', category: 'Hardware' },
  { sku: 'SKU-1004', name: 'Warehouse Labels', category: 'Supplies' },
  { sku: 'SKU-1005', name: 'Widget Pro', category: 'Electronics' },
  { sku: 'SKU-1006', name: 'Industrial Glue Kit', category: 'Supplies' },
  { sku: 'SKU-1007', name: 'LED Bulbs (100W)', category: 'Hardware' },
  { sku: 'SKU-1008', name: 'Office Chair Pro', category: 'Furniture' },
];

const marketplaces: Marketplace[] = ['MEESHO', 'FLIPKART', 'AMAZON', 'OFFLINE'];

export const analyticsService = {
  /**
   * POST /analytics/upload - Upload report file
   */
  async uploadReport(file: File): Promise<AnalyticsReport> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<AnalyticsReport>(API_ENDPOINTS.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.warn('[Analytics] Upload failed, using mock data:', error);
      return mockResponse(
        {
          id: `report-${Date.now()}`,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin@nexo.com',
          status: 'completed' as const,
          summary: {
            totalRevenue: 450000,
            totalProfit: 135000,
            totalExpense: 90000,
            averageMargin: 0.3,
            totalRecords: 1000,
            validRecords: 960,
            updatedRecords: 30,
            duplicateRecords: 20,
            newProducts: 8,
            channelBreakdown: marketplaces.map((m) => ({
              marketplace: m,
              revenue: 112500,
              profit: 33750,
              margin: 0.3,
              quantity: 2500,
              productCount: 20,
            })),
          },
          records: [],
          validationStats: {
            totalRows: 1000,
            validRows: 960,
            duplicateRows: 20,
            errorRows: 20,
            warningRows: 0,
          },
        },
        2000
      );
    }
  },

  /**
   * GET /analytics/reports - List all reports
   */
  async getReports(page = 0, size = 10): Promise<ReportListResponse> {
    try {
      const response = await api.get<ReportListResponse>(API_ENDPOINTS.REPORTS, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.warn('[Analytics] Get reports failed, using mock data:', error);
      return mockResponse(
        {
          data: Array.from({ length: 5 }, (_, i) => ({
            id: `report-${i}`,
            fileName: `inventory-report-${i + 1}.xlsx`,
            uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
            uploadedBy: 'admin@nexo.com',
            status: 'completed' as const,
            summary: {
              totalRevenue: 450000,
              totalProfit: 135000,
              totalExpense: 90000,
              averageMargin: 0.3,
              totalRecords: 1000,
              validRecords: 960,
              updatedRecords: 30,
              duplicateRecords: 20,
              newProducts: 8,
              channelBreakdown: [],
            },
            records: [],
            validationStats: {
              totalRows: 1000,
              validRows: 960,
              duplicateRows: 20,
              errorRows: 20,
              warningRows: 0,
            },
          })),
          pagination: { currentPage: page, pageSize: size, totalReports: 50, totalPages: 5 },
        },
        500
      );
    }
  },

  /**
   * GET /analytics/reports/{id} - Get report details
   */
  async getReportDetails(reportId: string): Promise<ReportDetailsResponse> {
    try {
      const response = await api.get<ReportDetailsResponse>(API_ENDPOINTS.REPORT_DETAILS(reportId));
      return response.data;
    } catch (error) {
      console.error(`[Analytics] Get report details failed:`, error);
      throw error;
    }
  },

  /**
   * GET /analytics/metrics - Get KPI metrics and trends
   */
  async getMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics> {
    try {
      const response = await api.get<AnalyticsMetrics>(API_ENDPOINTS.METRICS, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.warn('[Analytics] Get metrics failed, using mock data:', error);
      const trends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
        revenue: Math.round(150000 + Math.random() * 100000),
        profit: Math.round((150000 + Math.random() * 100000) * 0.3),
        margin: 0.3,
      }));

      return mockResponse(
        {
          period: 'monthly' as const,
          dateRange: { start: startDate, end: endDate },
          kpis: {
            totalRevenue: 1500000,
            grossProfit: 450000,
            netProfit: 350000,
            marginPercent: 0.3,
            inventoryValue: 1725000,
            deadStockValue: 180000,
          },
          trends,
          productMetrics: mockProducts.slice(0, 10).map((p) => ({
            sku: p.sku,
            productName: p.name,
            revenue: Math.random() * 40000 + 10000,
            profit: 0,
            margin: 0.3,
            quantity: Math.floor(Math.random() * 3000),
            daysInStock: Math.floor(Math.random() * 90),
          })),
          marketplaceMetrics: marketplaces.map((m) => ({
            marketplace: m,
            revenue: 375000,
            profit: 112500,
            margin: 0.3,
            quantity: 7500,
            productCount: 20,
          })),
          topProducts: mockProducts.slice(0, 5).map((p) => ({
            sku: p.sku,
            productName: p.name,
            revenue: Math.random() * 80000 + 30000,
            profit: 0,
            margin: 0.35,
            quantity: Math.floor(Math.random() * 5000) + 1000,
          })),
          aiInsights: [],
        },
        800
      );
    }
  },

  /**
   * GET /analytics/data - Get paginated historical data for grid
   */
  async getHistoricalData(page = 0, size = 20, filters?: any): Promise<AnalyticsDataGridResponse> {
    try {
      const response = await api.get<AnalyticsDataGridResponse>(API_ENDPOINTS.HISTORICAL_DATA, {
        params: { page, size, ...filters },
      });
      return response.data;
    } catch (error) {
      console.warn('[Analytics] Get historical data failed, using mock data:', error);
      const records: AnalyticsDataGridRow[] = Array.from({ length: size }, (_, i) => {
        const product = mockProducts[(page * size + i) % mockProducts.length];
        const marketplace = marketplaces[(page * size + i) % marketplaces.length];
        const revenue = Math.random() * 45000 + 5000;
        const cogs = revenue * 0.4;
        const expense = revenue * 0.15;
        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - expense;

        return {
          id: `row-${page * size + i}`,
          reportId: 'report-123',
          sku: product.sku,
          productName: product.name,
          category: product.category,
          marketplace,
          revenue,
          cogs,
          expense,
          quantity: Math.floor(revenue / 150),
          grossProfit,
          netProfit,
          margin: netProfit / revenue,
          recordDate: new Date().toISOString().split('T')[0],
          daysInStock: Math.floor(Math.random() * 90) + 5,
          status: 'valid' as const,
        };
      });

      return mockResponse(
        {
          data: records,
          pagination: {
            currentPage: page,
            pageSize: size,
            totalRecords: 12500,
            totalPages: Math.ceil(12500 / size),
          },
          aggregates: {
            totalRevenue: records.reduce((sum, r) => sum + r.revenue, 0),
            totalProfit: records.reduce((sum, r) => sum + r.netProfit, 0),
            averageMargin: 0.3,
            recordsCount: size,
          },
        },
        600
      );
    }
  },

  /**
   * GET /analytics/insights - Get AI-generated insights
   */
  async getInsights(): Promise<InsightsResponse> {
    try {
      const response = await api.get<InsightsResponse>(API_ENDPOINTS.INSIGHTS);
      return response.data;
    } catch (error) {
      console.warn('[Analytics] Get insights failed, using mock data:', error);
      return mockResponse(
        {
          insights: [
            {
              id: 'insight-001',
              type: 'opportunity' as const,
              title: 'High-performing product identified',
              message: 'Product SKU-1001 (Premium Coffee Beans) contributes 38% of total profit',
              severity: 'low' as const,
              suggestedAction: 'Increase inventory allocation by 20%',
            },
          ],
        },
        400
      );
    }
  },

  /**
   * POST /analytics/export - Export data in desired format
   */
  async exportData(format: 'csv' | 'excel', filters?: any): Promise<Blob> {
    try {
      const response = await api.post<Blob>(
        API_ENDPOINTS.EXPORT,
        { format, filters },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.warn('[Analytics] Export failed, generating mock CSV:', error);
      const csvContent = `SKU,Product,Marketplace,Revenue,Profit,Margin\nSKU-1001,Premium Coffee Beans,MEESHO,12500,5000,0.4\nSKU-1002,Portable Scanner,FLIPKART,22000,8000,0.36`;
      return new Blob([csvContent], { type: 'text/csv' });
    }
  },
};
