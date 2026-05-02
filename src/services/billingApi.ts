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
  async listInvoices(fromDate?: string, toDate?: string, page: number = 0, pageSize: number = 20) {
    const response = await api.get<InvoiceResponseDto[] | { content?: InvoiceResponseDto[]; totalPages?: number; totalElements?: number; pageNumber?: number }>("/invoice", {
      params: {
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
        page,
        size: pageSize,
      },
    });

    const rows = Array.isArray(response.data) ? response.data : response.data?.content ?? [];
    const invoices = rows.map(toPanelInvoice);
    
    // Check if API returned paginated data or all data
    const isPaginated = !Array.isArray(response.data) && (response.data as any)?.totalPages;
    
    if (isPaginated) {
      // API supports pagination
      return {
        invoices,
        totalPages: (response.data as any)?.totalPages ?? 1,
        totalElements: (response.data as any)?.totalElements ?? invoices.length,
        pageNumber: (response.data as any)?.pageNumber ?? page,
      };
    } else {
      // API returns all data - do client-side pagination
      const totalElements = invoices.length;
      const totalPages = Math.ceil(totalElements / pageSize) || 1;
      const start = page * pageSize;
      const end = start + pageSize;
      const paginatedInvoices = invoices.slice(start, end);
      
      return {
        invoices: paginatedInvoices,
        totalPages,
        totalElements,
        pageNumber: page,
      };
    }
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
