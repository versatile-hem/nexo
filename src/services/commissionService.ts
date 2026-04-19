import { mockResponse } from "@/services/api";
import { salesService } from "@/services/salesService";

export interface CommissionBreakdown {
  orderNumber: string;
  customerName: string;
  paidAmount: number;
  commission: number;
}

export interface MonthlyCommission {
  month: string;
  totalCommission: number;
  breakdown: CommissionBreakdown[];
}

const DEFAULT_COMMISSION_RATE = 0.05;

export const commissionService = {
  getMonthlyCommission: async (month: string, createdBy: string): Promise<MonthlyCommission> => {
    const orders = await salesService.listMyOrders(createdBy);
    const rows = orders
      .filter((order) => order.createdAt.slice(0, 7) === month)
      .map((order) => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        paidAmount: order.paidAmount,
        commission: order.paidAmount * DEFAULT_COMMISSION_RATE,
      }));

    const totalCommission = rows.reduce((sum, row) => sum + row.commission, 0);

    return mockResponse({
      month,
      totalCommission,
      breakdown: rows,
    });
  },
};
