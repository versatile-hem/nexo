import { db } from "@/mocks/data";
import { Order, OrderStatus } from "@/mocks/types";
import { mockResponse } from "@/services/api";

export const orderService = {
  getOrders: () => mockResponse([...db.orders]),

  updateOrderStatus: (id: string, status: OrderStatus) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) {
      return Promise.reject(new Error("Order not found"));
    }
    order.status = status;
    return mockResponse(order);
  },

  createOrder: (payload: Omit<Order, "id" | "createdAt">) => {
    const order: Order = {
      ...payload,
      id: `o-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.orders.unshift(order);
    return mockResponse(order);
  },
};
