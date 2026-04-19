import { db } from "@/mocks/data";
import { mockResponse } from "@/services/api";

export const customerService = {
  getCustomers: () => mockResponse([...db.customers]),
  getCustomerById: (customerId: string) => mockResponse(db.customers.find((c) => c.id === customerId)),
  getTransactions: (customerId: string) =>
    mockResponse(db.orders.filter((order) => order.customerId === customerId)),
};
