/**
 * Report and Record Types
 * Represents data from uploaded XLSX/CSV files
 */

export type ReportStatus = 'processing' | 'completed' | 'failed';
export type RecordStatus = 'valid' | 'updated' | 'duplicate' | 'failed';
export type Marketplace = 'MEESHO' | 'FLIPKART' | 'AMAZON' | 'OFFLINE';

export interface AnalyticsReport {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: ReportStatus;
  summary: ReportSummary;
  records: ProductAnalyticsRecord[];
  validationStats: ValidationStats;
}

export interface ProductAnalyticsRecord {
  id?: string;
  reportId?: string;
  sku: string;
  productName: string;
  category?: string;
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
  status: RecordStatus;
  validationErrors?: string[];
}

export interface ReportSummary {
  totalRevenue: number;
  totalProfit: number;
  totalExpense: number;
  averageMargin: number;
  totalRecords: number;
  validRecords: number;
  updatedRecords: number;
  duplicateRecords: number;
  newProducts: number;
  channelBreakdown: ChannelMetrics[];
}

export interface ChannelMetrics {
  marketplace: string;
  revenue: number;
  profit: number;
  margin: number;
  quantity: number;
  productCount: number;
}

export interface ValidationStats {
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  errorRows: number;
  warningRows: number;
}

export interface ReportListResponse {
  data: AnalyticsReport[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalReports: number;
    totalPages: number;
  };
}

export interface ReportDetailsResponse {
  data: AnalyticsReport;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}
