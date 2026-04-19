import { db } from "@/mocks/data";
import { mockResponse } from "@/services/api";
import { Invoice } from "@/mocks/types";

export type TaxType = "CGST_SGST" | "IGST";

export interface InvoiceCustomer {
  id: string;
  name: string;
  billingAddress: string;
  gstin: string;
  state: string;
}

export interface InvoiceProduct {
  id: string;
  name: string;
  hsn: string;
  price: number;
}

export interface InvoiceItemInput {
  productId?: string;
  productName: string;
  hsn: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

export interface InvoiceLineCalculated extends InvoiceItemInput {
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxType: TaxType;
}

export interface InvoiceDraft {
  customer: InvoiceCustomer | null;
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  items: InvoiceItemInput[];
}

const COMPANY_STATE = "Haryana";

const invoiceProducts: InvoiceProduct[] = [
  { id: "1", name: "Ebook", hsn: "4901", price: 100 },
  { id: "2", name: "Electric socket", hsn: "8536", price: 200 },
];

export const companyProfile = {
  name: "EARENDEL ONLINE SERVICES PRIVATE LIMITED",
  address: "588A, Sector 46, Faridabad, Haryana, India",
  phone: "+91-7988033662",
  email: "contact@earendel.com",
  website: "www.earendel.com",
  gstin: "06AAICE7379R1ZN",
  pan: "AAICE7379R",
  state: COMPANY_STATE,
};

export const invoiceService = {
  getCustomers: async (): Promise<InvoiceCustomer[]> =>
    mockResponse(
      db.customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        billingAddress: customer.billingAddress,
        gstin: customer.gstin,
        state: customer.state,
      })),
    ),

  getProducts: async (): Promise<InvoiceProduct[]> => mockResponse([...invoiceProducts]),

  generateInvoiceNumber: () => `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`,

  calculateTotals: (items: InvoiceItemInput[], customerState: string): { lines: InvoiceLineCalculated[]; totals: InvoiceTotals } => {
    const lines = items.map((item) => {
      const qty = Number(item.qty) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const taxableAmount = Math.max(0, qty * unitPrice - discount);
      const taxAmount = taxableAmount * ((Number(item.taxRate) || 0) / 100);
      const totalAmount = taxableAmount + taxAmount;
      return {
        ...item,
        qty,
        unitPrice,
        discount,
        taxRate: Number(item.taxRate) || 0,
        taxableAmount,
        taxAmount,
        totalAmount,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    const totalDiscount = lines.reduce((sum, line) => sum + line.discount, 0);
    const totalTax = lines.reduce((sum, line) => sum + line.taxAmount, 0);
    const grandTotal = lines.reduce((sum, line) => sum + line.totalAmount, 0);

    const taxType: TaxType = normalizeState(customerState) === normalizeState(COMPANY_STATE) ? "CGST_SGST" : "IGST";
    const cgst = taxType === "CGST_SGST" ? totalTax / 2 : 0;
    const sgst = taxType === "CGST_SGST" ? totalTax / 2 : 0;
    const igst = taxType === "IGST" ? totalTax : 0;

    return {
      lines,
      totals: { subtotal, totalDiscount, totalTax, grandTotal, cgst, sgst, igst, taxType },
    };
  },

  createInvoice: async (draft: InvoiceDraft) => {
    const { lines, totals } = invoiceService.calculateTotals(draft.items, draft.placeOfSupply);

    const invoiceRecord: Invoice = {
      id: draft.invoiceNumber,
      customerId: draft.customer?.id ?? "",
      customerName: draft.customer?.name ?? "",
      issuedAt: draft.invoiceDate,
      lineItems: lines.map((line) => ({
        productId: line.productId ?? line.productName,
        description: line.productName,
        hsn: line.hsn,
        qty: line.qty,
        unitPrice: line.unitPrice,
        discount: line.discount,
        gstRate: line.taxRate,
        taxAmount: line.taxAmount,
        totalAmount: line.totalAmount,
      })),
      subtotal: totals.subtotal,
      tax: totals.totalTax,
      total: totals.grandTotal,
    };

    db.invoices.unshift(invoiceRecord);
    return mockResponse({ invoice: invoiceRecord, totals, lines });
  },
};

function normalizeState(value: string) {
  return value.trim().toLowerCase();
}
