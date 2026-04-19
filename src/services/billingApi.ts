import { api } from "@/services/api";
import { BillingPanelInvoice, ClientResponseDto, InvoiceResponseDto } from "@/services/apiModels";

export const billingApi = {
  async listInvoices() {
    const response = await api.get<InvoiceResponseDto[]>("/invoice");
    return response.data.map(toPanelInvoice);
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
};

function toPanelInvoice(dto: InvoiceResponseDto): BillingPanelInvoice {
  return {
    id: String(dto.id),
    customerName: dto.customerName || "Unknown",
    billDate: dto.billDate || "-",
    totalAmount: Number(dto.totalAmount ?? 0),
    status: dto.status || "UNKNOWN",
  };
}
