export interface ProductDto {
  productId?: number;
  name?: string;
  sku?: string;
  product_title?: string;
  barcode?: string;
  hsnCode?: string;
  unit?: string;
  price?: number;
  category?: string;
  availableStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryBalanceResponseDto {
  productId: number;
  quantity: number;
}

export interface StockInRequestDto {
  productId: number;
  quantity: number;
  unit: string;
  supplier?: string;
  batchNumber?: string;
  movementTime?: string;
}

export interface DailyOperationRequestDto {
  type: "ORDER" | "RETURN";
  productId: number;
  quantity: number;
  unit: string;
  courier?: string;
  channel?: "FLIPKART" | "MEESHO" | "OFFLINE" | "AMAZON" | "WAREHOUSE";
  movementTime?: string;
}

export interface InvoiceResponseDto {
  id: number;
  billNo?: string;
  customerName?: string;
  customerPhone?: string;
  billDate?: string;
  totalAmount?: number;
  status?: string;
}

export interface ClientResponseDto {
  customerName?: string;
  customerPhone?: string;
}

export interface AppProduct {
  id: string;
  name: string;
  sku: string;
  hsn?: string;
  barcode?: string;
  price: number;
  category: string;
  stock: number;
}

export interface InventoryBalance {
  productId: string;
  quantity: number;
}

export interface BillingPanelInvoice {
  id: string;
  customerName: string;
  billDate: string;
  totalAmount: number;
  status: string;
}

export interface BillingClient {
  customerName: string;
  customerPhone: string;
}
