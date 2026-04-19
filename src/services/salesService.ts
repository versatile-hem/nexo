import { db } from "@/mocks/data";
import { api, mockResponse } from "@/services/api";

export type SalesPaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface SalesOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  amount: number;
  paidAmount: number;
  paymentStatus: SalesPaymentStatus;
  createdAt: string;
  items: SalesOrderItem[];
}

export interface CreateSalesOrderPayload {
  customerId: string;
  customerName: string;
  createdBy: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const localSalesOrders: SalesOrder[] = db.orders.map((order) => ({
  id: order.id,
  orderNumber: order.id,
  customerId: order.customerId,
  customerName: order.customer,
  createdBy: "Hem",
  amount: order.amount,
  paidAmount: order.status === "delivered" ? order.amount : order.status === "shipped" ? order.amount * 0.5 : 0,
  paymentStatus: order.status === "delivered" ? "PAID" : order.status === "shipped" ? "PARTIAL" : "UNPAID",
  createdAt: order.createdAt,
  items: [],
}));

export const salesService = {
  listMyOrders: async (createdBy: string): Promise<SalesOrder[]> => {
    try {
      const response = await api.get<SalesOrder[]>("/sales-orders", {
        params: createdBy ? { createdBy } : undefined,
      });
      return (response.data ?? []).map(normalizeSalesOrder);
    } catch {
      const rows = localSalesOrders
        .filter((row) => !createdBy || row.createdBy.toLowerCase() === createdBy.toLowerCase())
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return mockResponse(rows);
    }
  },

  createOrder: async (payload: CreateSalesOrderPayload): Promise<SalesOrder> => {
    try {
      const response = await api.post<SalesOrder>("/sales-orders", payload);
      return normalizeSalesOrder(response.data);
    } catch {
      const amount = payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const now = new Date().toISOString();
      const order: SalesOrder = {
        id: `so-${Date.now()}`,
        orderNumber: `SO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`,
        customerId: payload.customerId,
        customerName: payload.customerName,
        createdBy: payload.createdBy,
        amount,
        paidAmount: 0,
        paymentStatus: "UNPAID",
        createdAt: now,
        items: payload.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      };
      localSalesOrders.unshift(order);
      return mockResponse(order);
    }
  },

  applyPayment: async (orderId: string, amount: number): Promise<SalesOrder | null> => {
    const order = localSalesOrders.find((row) => row.id === orderId || row.orderNumber === orderId);
    if (!order) return null;

    order.paidAmount = Math.min(order.amount, order.paidAmount + amount);
    if (order.paidAmount <= 0) {
      order.paymentStatus = "UNPAID";
    } else if (order.paidAmount < order.amount) {
      order.paymentStatus = "PARTIAL";
    } else {
      order.paymentStatus = "PAID";
    }

    return mockResponse({ ...order });
  },
};

function normalizeSalesOrder(order: SalesOrder): SalesOrder {
  const amount = Number(order.amount ?? 0);
  const paidAmount = Number(order.paidAmount ?? 0);
  const paymentStatus = paidAmount <= 0 ? "UNPAID" : paidAmount < amount ? "PARTIAL" : "PAID";

  return {
    ...order,
    amount,
    paidAmount,
    paymentStatus,
    items: order.items ?? [],
  };
}
