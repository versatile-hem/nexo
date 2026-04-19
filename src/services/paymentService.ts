import { api, mockResponse } from "@/services/api";
import { salesService } from "@/services/salesService";

export type PaymentMode = "CASH" | "UPI" | "BANK_TRANSFER";

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  mode: PaymentMode;
  note?: string;
  paidAt: string;
}

const localPayments: PaymentRecord[] = [];

export const paymentService = {
  addPayment: async (payload: { orderId: string; amount: number; mode: PaymentMode; note?: string }) => {
    try {
      const response = await api.post<PaymentRecord>("/payments", payload);
      return response.data;
    } catch {
      const payment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        orderId: payload.orderId,
        amount: payload.amount,
        mode: payload.mode,
        note: payload.note,
        paidAt: new Date().toISOString(),
      };
      localPayments.unshift(payment);
      await salesService.applyPayment(payload.orderId, payload.amount);
      return mockResponse(payment);
    }
  },

  getPayments: async (orderId?: string) => {
    try {
      const response = await api.get<PaymentRecord[]>("/payments", {
        params: orderId ? { orderId } : undefined,
      });
      return response.data ?? [];
    } catch {
      const rows = orderId ? localPayments.filter((item) => item.orderId === orderId) : localPayments;
      return mockResponse(rows);
    }
  },
};
