import { db } from "@/mocks/data";
import { api, mockResponse } from "@/services/api";

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  billingAddress: string;
  gstin: string;
  state: string;
}

interface CustomerDto {
  id?: number | string;
  customerId?: number | string;
  name?: string;
  customerName?: string;
  phone?: string;
  customerPhone?: string;
  email?: string;
  gstin?: string;
  gstNo?: string;
  address?: string;
  billingAddress?: string;
  state?: string;
}

interface CreateCustomerPayload {
  name: string;
  phone: string;
  gstin: string;
  address: string;
  state: string;
}

export const customerService = {
  getCustomers: async (): Promise<CustomerRecord[]> => {
    const response = await api.get<CustomerDto[]>("/customers");
    return (response.data ?? []).map(toCustomerRecord);
  },

  getCustomerById: async (customerId: string): Promise<CustomerRecord> => {
    const response = await api.get<CustomerDto>(`/customers/${customerId}`);
    return toCustomerRecord(response.data);
  },

  searchCustomers: async (query: string): Promise<CustomerRecord[]> => {
    const response = await api.get<CustomerDto[]>("/customers", {
      params: query.trim() ? { q: query.trim() } : undefined,
    });
    const mapped = (response.data ?? []).map(toCustomerRecord);
    if (!query.trim()) {
      return mapped;
    }
    const term = query.trim().toLowerCase();
    return mapped.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.gstin.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term),
    );
  },

  createCustomer: async (data: CreateCustomerPayload): Promise<CustomerRecord> => {
    const response = await api.post<CustomerDto>("/customers", {
      name: data.name,
      phone: data.phone,
      gstin: data.gstin,
      address: data.address,
      state: data.state,
    });
    return toCustomerRecord(response.data);
  },

  getTransactions: (customerId: string) =>
    mockResponse(db.orders.filter((order) => order.customerId === customerId)),
};

function toCustomerRecord(dto: CustomerDto): CustomerRecord {
  return {
    id: String(dto.id ?? dto.customerId ?? ""),
    name: dto.name ?? dto.customerName ?? "Unknown Customer",
    phone: dto.phone ?? dto.customerPhone ?? "",
    email: dto.email ?? "",
    billingAddress: dto.billingAddress ?? dto.address ?? "",
    gstin: dto.gstin ?? dto.gstNo ?? "",
    state: dto.state ?? "",
  };
}
