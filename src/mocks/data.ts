import { Customer, DailyReport, Invoice, Order, Product, StockMovement } from "@/mocks/types";

export const mockProducts: Product[] = [
  { id: "p-1", name: "Premium Coffee Beans", sku: "SKU-1001", price: 18.5, stock: 42, category: "Groceries", batchCode: "LOT-A11" },
  { id: "p-2", name: "Portable Scanner", sku: "SKU-1002", price: 210, stock: 8, category: "Electronics", batchCode: "LOT-B14" },
  { id: "p-3", name: "Thermal Printer", sku: "SKU-1003", price: 126, stock: 14, category: "Hardware", batchCode: "LOT-C02" },
  { id: "p-4", name: "Warehouse Labels", sku: "SKU-1004", price: 9.75, stock: 4, category: "Supplies", batchCode: "LOT-L07" },
  { id: "1", name: "Ebook", sku: "EBK-01", price: 3.5, stock: 300, category: "Digital", batchCode: "LOT-E01" },
  { id: "2", name: "Pink potty seat non foldable", sku: "PPS-01", price: 22, stock: 55, category: "Kids", batchCode: "LOT-PPS" },
  { id: "3", name: "Electric socket white 12 vale", sku: "ES-12", price: 6.75, stock: 120, category: "Hardware", batchCode: "LOT-ES12" },
];

export const mockOrders: Order[] = [
  { id: "o-1001", customerId: "c-1", customer: "ABC Traders", status: "pending", amount: 880, createdAt: "2026-04-19" },
  { id: "o-1002", customerId: "c-2", customer: "XYZ Enterprises", status: "shipped", amount: 1240, createdAt: "2026-04-18" },
  { id: "o-1003", customerId: "c-3", customer: "Northline Stores", status: "delivered", amount: 560, createdAt: "2026-04-17" },
];

export const mockCustomers: Customer[] = [
  {
    id: "c-1",
    name: "ABC Traders",
    phone: "+91-9876543210",
    email: "accounts@abctraders.in",
    billingAddress: "12 Market Road, Sector 15, Faridabad, Haryana, India",
    gstin: "06XXXXX",
    state: "Haryana",
  },
  {
    id: "c-2",
    name: "XYZ Enterprises",
    phone: "+91-9876500000",
    email: "finance@xyzent.in",
    billingAddress: "44 Connaught Place, New Delhi, Delhi, India",
    gstin: "07XXXXX",
    state: "Delhi",
  },
  {
    id: "c-3",
    name: "Northline Stores",
    phone: "+1-555-0160",
    email: "accounts@northline.com",
    billingAddress: "77 Hill Street, Gurugram, Haryana, India",
    gstin: "06ABCDE1234F1Z5",
    state: "Haryana",
  },
];

export const mockStockMovements: StockMovement[] = [
  { id: "sm-1", productId: "p-1", product: "Premium Coffee Beans", type: "IN", qty: 50, date: "2026-04-12" },
  { id: "sm-2", productId: "p-2", product: "Portable Scanner", type: "OUT", qty: 4, date: "2026-04-15" },
  { id: "sm-3", productId: "p-4", product: "Warehouse Labels", type: "OUT", qty: 6, date: "2026-04-18" },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv-2001",
    customerId: "c-1",
    customerName: "Aster Retail",
    issuedAt: "2026-04-15",
    lineItems: [
      { productId: "p-2", description: "Portable Scanner", qty: 2, unitPrice: 210, gstRate: 18 },
    ],
    subtotal: 420,
    tax: 75.6,
    total: 495.6,
  },
];

export const mockDailyReports: DailyReport[] = [];

export const db = {
  products: mockProducts,
  orders: mockOrders,
  customers: mockCustomers,
  stockMovements: mockStockMovements,
  invoices: mockInvoices,
  dailyReports: mockDailyReports,
};
