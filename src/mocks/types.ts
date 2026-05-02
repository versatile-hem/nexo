export type OrderStatus = "pending" | "shipped" | "delivered";
export type StockMovementType = "IN" | "OUT";

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  category: string;
  batchCode?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: string;
  status: OrderStatus;
  amount: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  billingAddress: string;
  gstin: string;
  state: string;
}

export interface StockMovementItem {
  id?: string | number;
  productId: string | number;
  productName: string;
  sku?: string;
  quantity: number;
  reference?: string;
}

export interface StockMovement {
  id: string;
  productId?: string;
  product?: string;
  type: StockMovementType;
  qty?: number;
  date?: string;
  // API response fields
  reference?: string;
  createdAt?: string;
  items?: StockMovementItem[];
  createdBy?: string;
  notes?: string;
}

export interface StockInEntry {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  receivedAt: string;
  note?: string;
}

export interface InvoiceLineItem {
  productId: string;
  description: string;
  hsn?: string;
  qty: number;
  unitPrice: number;
  discount?: number;
  gstRate: number;
  taxAmount?: number;
  totalAmount?: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  issuedAt: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export type SalesChannel = "Meesho" | "Flipkart" | "Amazon" | "Offline";
export type DailyOpsUnit = "nos" | "box" | "packet";

export interface ProductOption {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
}

interface DailyOpsBaseRow {
  productId?: string;
  productName: string;
  barcode?: string;
  qty: number;
  unit: DailyOpsUnit;
}

export interface DailyOpsOrderRow extends DailyOpsBaseRow {
  courier: string;
}

export interface DailyOpsReturnRow extends DailyOpsBaseRow {
  courier?: string;
}

export interface DailyReport {
  id: string;
  date: string;
  channel: SalesChannel;
  orders: DailyOpsOrderRow[];
  returns: DailyOpsReturnRow[];
  createdAt: string;
}
