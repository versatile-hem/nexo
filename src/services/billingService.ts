import { db } from "@/mocks/data";
import { Invoice, InvoiceLineItem } from "@/mocks/types";
import { mockResponse } from "@/services/api";

function calcTotals(items: InvoiceLineItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const tax = items.reduce(
    (sum, item) => sum + (item.qty * item.unitPrice * item.gstRate) / 100,
    0,
  );
  return { subtotal, tax, total: subtotal + tax };
}

export const billingService = {
  getInvoices: () => mockResponse([...db.invoices]),
  createInvoice: (payload: Omit<Invoice, "id" | "subtotal" | "tax" | "total">) => {
    const totals = calcTotals(payload.lineItems);
    const invoice: Invoice = {
      ...payload,
      ...totals,
      id: `inv-${Date.now()}`,
    };
    db.invoices.unshift(invoice);
    return mockResponse(invoice);
  },
};
