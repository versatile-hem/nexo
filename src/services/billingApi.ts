import { api } from "@/services/api";
import { BillingPanelInvoice, ClientResponseDto, InvoiceResponseDto } from "@/services/apiModels";

export interface GenerateBillingInvoiceItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface GenerateBillingInvoicePayload {
  billNo: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  billDate: string;
  discountAmount: number;
  paymentMode: "UPI" | "CASH" | "CARD" | "BANK_TRANSFER";
  status: "PAID" | "PENDING" | "PARTIAL";
  items: GenerateBillingInvoiceItem[];
}

export const billingApi = {
  async listInvoices(fromDate?: string, toDate?: string) {
    const response = await api.get<InvoiceResponseDto[] | { content?: InvoiceResponseDto[] }>("/invoice", {
      params: {
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      },
    });

    const rows = Array.isArray(response.data) ? response.data : response.data?.content ?? [];
    return rows.map(toPanelInvoice);
  },

  async listClients(q?: string) {
    const response = await api.get<ClientResponseDto[]>("/client", {
      params: q ? { q } : undefined,
    });
    return response.data.map((item) => ({
      customerName: item.customerName || "Unknown",
      customerPhone: item.customerPhone || "-",
    }));
  },

  async generateInvoice(payload: GenerateBillingInvoicePayload) {
    const response = await api.post<unknown>("/billing/generate", payload);
    return response.data;
  },
};

function toPanelInvoice(dto: InvoiceResponseDto): BillingPanelInvoice {
  return {
    id: dto.billNo || String(dto.id),
    customerName: dto.customerName || "Unknown",
    billDate: dto.billDate || "-",
    totalAmount: Number(dto.totalAmount ?? 0),
    status: dto.status || "UNKNOWN",
  };
}
