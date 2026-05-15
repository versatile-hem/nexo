/**
 * Mock Analytics Service
 * Generates realistic analytics data for frontend development
 * Will be replaced with real API calls when backend is ready
 */

import type {
  AnalyticsReport,
  ProductAnalyticsRecord,
  ChannelMetrics,
  ValidationStats,
  ReportListResponse,
  ReportDetailsResponse,
  Marketplace,
} from '../types/reports';
import type {
  AnalyticsMetrics,
  AIInsight,
  AnalyticsDataGridResponse,
  AnalyticsDataGridRow,
  InsightsResponse,
} from '../types/analytics';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock products database
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

function generateRandomRevenue(min = 5000, max = 50000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProductRecord(
  sku: string,
  productName: string,
  marketplace: Marketplace,
  recordDate: string
): ProductAnalyticsRecord {
  const revenue = generateRandomRevenue(5000, 50000);
  const cogs = revenue * 0.4;
  const expense = revenue * 0.15;
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expense;
  const margin = netProfit / revenue;

  return {
    sku,
    productName,
    category: 'Groceries',
    marketplace,
    revenue,
    cogs,
    expense,
    quantity: Math.floor(revenue / 150),
    grossProfit,
    netProfit,
    margin,
    recordDate,
    daysInStock: Math.floor(Math.random() * 90) + 5,
    status: 'valid',
    validationErrors: [],
  };
}

function generateChannelMetrics(marketplace: Marketplace, recordCount: number): ChannelMetrics {
  const revenue = recordCount * 15000;
  const profit = revenue * 0.3;
  const margin = 0.3;

  return {
    marketplace,
    revenue,
    profit,
    margin,
    quantity: recordCount * 500,
    productCount: Math.floor(recordCount / 2),
  };
}

function generateValidationStats(totalRecords: number): ValidationStats {
  const validRecords = Math.floor(totalRecords * 0.96);
  const duplicateRecords = Math.floor(totalRecords * 0.03);
  const errorRecords = totalRecords - validRecords - duplicateRecords;

  return {
    totalRows: totalRecords,
    validRows: validRecords,
    duplicateRows: duplicateRecords,
    errorRows: errorRecords,
    warningRows: 0,
  };
}

function generateTrendData(startDate: string, days: number = 30) {
  const trends = [];
  const date = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const baseRevenue = 150000 + Math.random() * 100000;
    trends.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue),
      profit: Math.round(baseRevenue * 0.3),
      margin: 0.3,
    });
    date.setDate(date.getDate() + 1);
  }

  return trends;
}

function generateAIInsights(): AIInsight[] {
  return [
    {
      id: 'insight-001',
      type: 'opportunity',
      title: 'High-performing product identified',
      message: 'Product SKU-1001 (Premium Coffee Beans) contributes 38% of total profit',
      severity: 'low',
      suggestedAction: 'Increase inventory allocation by 20%',
      metric: 'profitContribution',
      value: '38%',
    },
    {
      id: 'insight-002',
      type: 'warning',
      title: 'Dead stock alert',
      message: 'Dead stock value increased by 12% this month (now ₹85,000)',
      severity: 'high',
      suggestedAction: 'Review slow-moving inventory for markdowns',
      metric: 'deadStock',
      value: '₹85,000',
    },
    {
      id: 'insight-003',
      type: 'insight',
      title: 'Marketplace performance disparity',
      message: 'Flipkart orders have lowest margins (8%) vs Meesho (30%)',
      severity: 'medium',
      suggestedAction: 'Optimize Flipkart pricing strategy',
      metric: 'marginComparison',
      value: '8% vs 30%',
    },
    {
      id: 'insight-004',
      type: 'opportunity',
      title: 'Revenue peak identified',
      message: 'Revenue peaked on Tuesday, May 14 (₹22,500)',
      severity: 'low',
      suggestedAction: 'Analyze factors and replicate success patterns',
      metric: 'revenuePeak',
      value: '₹22,500',
    },
  ];
}

export const analyticsService = {
  /**
   * Mock file upload - generates report with parsed data
   */
  async uploadReport(file: File): Promise<AnalyticsReport> {
    await delay(2000); // Simulate upload delay

    const totalRecords = Math.floor(Math.random() * 800) + 200;
    const records: ProductAnalyticsRecord[] = [];
    const recordDate = new Date().toISOString().split('T')[0];

    // Generate records across all marketplaces
    for (let i = 0; i < totalRecords; i++) {
      const product = mockProducts[i % mockProducts.length];
      const marketplace = marketplaces[i % marketplaces.length];

      records.push(
        generateProductRecord(product.sku, product.name, marketplace, recordDate)
      );
    }

    const channelBreakdown = marketplaces.map((m) =>
      generateChannelMetrics(m, totalRecords / 4)
    );

    const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);
    const totalProfit = records.reduce((sum, r) => sum + r.netProfit, 0);
    const totalExpense = records.reduce((sum, r) => sum + r.expense, 0);
    const avgMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
    const validRecords = records.filter((r) => r.status === 'valid').length;

    const report: AnalyticsReport = {
      id: `report-${Date.now()}`,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin@nexo.com',
      status: 'completed',
      summary: {
        totalRevenue,
        totalProfit,
        totalExpense,
        averageMargin: avgMargin,
        totalRecords,
        validRecords,
        updatedRecords: Math.floor(totalRecords * 0.03),
        duplicateRecords: Math.floor(totalRecords * 0.02),
        newProducts: mockProducts.length,
        channelBreakdown,
      },
      records: records.slice(0, 50), // Return first 50 for preview
      validationStats: generateValidationStats(totalRecords),
    };

    return report;
  },

  /**
   * Get all reports with pagination
   */
  async getReports(page = 0, size = 10): Promise<ReportListResponse> {
    await delay(500);

    const reports: AnalyticsReport[] = Array.from({ length: 5 }, (_, i) => {
      const totalRecords = 1000 + Math.random() * 500;
      const channelBreakdown = marketplaces.map((m) =>
        generateChannelMetrics(m, totalRecords / 4)
      );

      return {
        id: `report-${i}`,
        fileName: `inventory-report-${i + 1}.xlsx`,
        uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
        uploadedBy: 'admin@nexo.com',
        status: 'completed' as const,
        summary: {
          totalRevenue: 450000 + Math.random() * 100000,
          totalProfit: 135000 + Math.random() * 50000,
          totalExpense: 90000 + Math.random() * 30000,
          averageMargin: 0.3,
          totalRecords: Math.floor(totalRecords),
          validRecords: Math.floor(totalRecords * 0.96),
          updatedRecords: Math.floor(totalRecords * 0.03),
          duplicateRecords: Math.floor(totalRecords * 0.02),
          newProducts: 12,
          channelBreakdown,
        },
        records: [],
        validationStats: generateValidationStats(Math.floor(totalRecords)),
      };
    });

    return {
      data: reports.slice(page * size, (page + 1) * size),
      pagination: {
        currentPage: page,
        pageSize: size,
        totalReports: 25,
        totalPages: Math.ceil(25 / size),
      },
    };
  },

  /**
   * Get specific report with pagination
   */
  async getReportDetails(reportId: string, page = 0, size = 20): Promise<ReportDetailsResponse> {
    await delay(500);

    const totalRecords = 1250;
    const records: ProductAnalyticsRecord[] = Array.from({ length: size }, (_, i) => {
      const product = mockProducts[(page * size + i) % mockProducts.length];
      const marketplace = marketplaces[(page * size + i) % marketplaces.length];
      return generateProductRecord(
        product.sku,
        product.name,
        marketplace,
        new Date().toISOString().split('T')[0]
      );
    });

    const channelBreakdown = marketplaces.map((m) =>
      generateChannelMetrics(m, totalRecords / 4)
    );

    const allRecords = Array.from({ length: totalRecords }, (_, i) => {
      const product = mockProducts[i % mockProducts.length];
      const marketplace = marketplaces[i % marketplaces.length];
      return generateProductRecord(
        product.sku,
        product.name,
        marketplace,
        new Date().toISOString().split('T')[0]
      );
    });

    const totalRevenue = allRecords.reduce((sum, r) => sum + r.revenue, 0);
    const totalProfit = allRecords.reduce((sum, r) => sum + r.netProfit, 0);
    const totalExpense = allRecords.reduce((sum, r) => sum + r.expense, 0);

    return {
      data: {
        id: reportId,
        fileName: 'inventory-report.xlsx',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin@nexo.com',
        status: 'completed',
        records,
        summary: {
          totalRevenue,
          totalProfit,
          totalExpense,
          averageMargin: totalProfit / totalRevenue,
          totalRecords,
          validRecords: Math.floor(totalRecords * 0.96),
          updatedRecords: Math.floor(totalRecords * 0.03),
          duplicateRecords: Math.floor(totalRecords * 0.02),
          newProducts: 12,
          channelBreakdown,
        },
        validationStats: generateValidationStats(totalRecords),
      },
      pagination: {
        currentPage: page,
        pageSize: size,
        totalRecords,
        totalPages: Math.ceil(totalRecords / size),
      },
    };
  },

  /**
   * Get analytics metrics (KPIs and trends)
   */
  async getMetrics(
    startDate: string,
    endDate: string,
    _marketplaces?: string[]
  ): Promise<AnalyticsMetrics> {
    await delay(800);

    const trends = generateTrendData(startDate);
    const topProducts = mockProducts.slice(0, 5).map((p) => ({
      sku: p.sku,
      productName: p.name,
      revenue: generateRandomRevenue(30000, 80000),
      profit: 0,
      margin: 0.35,
      quantity: Math.floor(Math.random() * 5000) + 1000,
    }));

    // Calculate profits
    topProducts.forEach((p) => {
      p.profit = p.revenue * 0.3;
    });

    const marketplaceMetrics = marketplaces.map((m) =>
      generateChannelMetrics(m, Math.floor(Math.random() * 100) + 50)
    );

    const totalRevenue = marketplaceMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalProfit = marketplaceMetrics.reduce((sum, m) => sum + m.profit, 0);

    return {
      period: 'monthly',
      dateRange: { start: startDate, end: endDate },
      kpis: {
        totalRevenue,
        grossProfit: totalProfit * 1.2,
        netProfit: totalProfit,
        marginPercent: 0.3,
        inventoryValue: totalRevenue * 1.15,
        deadStockValue: totalRevenue * 0.12,
      },
      trends,
      productMetrics: mockProducts.slice(0, 10).map((p) => ({
        sku: p.sku,
        productName: p.name,
        revenue: generateRandomRevenue(10000, 40000),
        profit: 0,
        margin: 0.3,
        quantity: Math.floor(Math.random() * 3000),
        daysInStock: Math.floor(Math.random() * 90),
      })),
      marketplaceMetrics,
      topProducts,
      aiInsights: generateAIInsights(),
    };
  },

  /**
   * Get historical analytics data for grid
   */
  async getHistoricalData(
    page = 0,
    size = 20,
    _filters?: any
  ): Promise<AnalyticsDataGridResponse> {
    await delay(600);

    const totalRecords = 12500;
    const records: AnalyticsDataGridRow[] = Array.from({ length: size }, (_, i) => {
      const product = mockProducts[(page * size + i) % mockProducts.length];
      const marketplace = marketplaces[(page * size + i) % marketplaces.length];
      const revenue = generateRandomRevenue(5000, 50000);
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
        status: 'valid',
      };
    });

    const allRecords = Array.from({ length: totalRecords }, () => {
      const revenue = generateRandomRevenue(5000, 50000);
      const cogs = revenue * 0.4;
      const expense = revenue * 0.15;
      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - expense;

      return {
        revenue,
        netProfit,
        grossProfit,
        cogs,
        expense,
      };
    });

    const totalRevenue = allRecords.reduce((sum, r) => sum + r.revenue, 0);
    const totalProfit = allRecords.reduce((sum, r) => sum + r.netProfit, 0);

    return {
      data: records,
      pagination: {
        currentPage: page,
        pageSize: size,
        totalRecords,
        totalPages: Math.ceil(totalRecords / size),
      },
      aggregates: {
        totalRevenue,
        totalProfit,
        averageMargin: totalProfit / totalRevenue,
        recordsCount: totalRecords,
      },
    };
  },

  /**
   * Get AI insights
   */
  async getInsights(): Promise<InsightsResponse> {
    await delay(400);
    return {
      insights: generateAIInsights(),
    };
  },

  /**
   * Export data (mock - returns blob)
   */
  async exportData(format: 'csv' | 'excel'): Promise<Blob> {
    await delay(1000);

    const csvContent = `SKU,Product,Marketplace,Revenue,Profit,Margin\nSKU-1001,Premium Coffee Beans,MEESHO,12500,5000,0.4\nSKU-1002,Portable Scanner,FLIPKART,22000,8000,0.36`;

    return new Blob([csvContent], {
      type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel',
    });
  },
};
