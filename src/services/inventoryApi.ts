import { api } from "@/services/api";
import { InventoryBalance, InventoryBalanceResponseDto } from "@/services/apiModels";

interface InsightProductRow {
  productId?: string;
  name: string;
  qty: number;
}

export const inventoryApi = {
  async getByQueryProductId(productId: string) {
    const response = await api.get<InventoryBalanceResponseDto>("/inventory", {
      params: { productId },
    });
    return toInventoryBalance(response.data);
  },

  async getByPathProductId(productId: string) {
    const response = await api.get<InventoryBalanceResponseDto>(`/inventory/${productId}`);
    return toInventoryBalance(response.data);
  },

  async getLowStock(): Promise<InsightProductRow[]> {
    const response = await api.get<Array<{ productId?: number | string; productName?: string; name?: string; qty?: number; quantity?: number }>>("/inventory/low-stock");
    return (response.data ?? []).map((item) => ({
      productId: item.productId !== undefined ? String(item.productId) : undefined,
      name: item.productName || item.name || "Unnamed",
      qty: Number(item.qty ?? item.quantity ?? 0),
    }));
  },

  async getStockValue(): Promise<number> {
    const response = await api.get<unknown>("/inventory/stock-value");
    return extractNumericValue(response.data);
  },

  async getTopProducts(): Promise<InsightProductRow[]> {
    const response = await api.get<Array<{ productId?: number | string; productName?: string; name?: string; qty?: number; quantity?: number }>>("/inventory/top-products");
    return (response.data ?? []).map((item) => ({
      productId: item.productId !== undefined ? String(item.productId) : undefined,
      name: item.productName || item.name || "Unnamed",
      qty: Number(item.qty ?? item.quantity ?? 0),
    }));
  },
};

function toInventoryBalance(dto: InventoryBalanceResponseDto): InventoryBalance {
  return {
    productId: String(dto.productId),
    quantity: Number(dto.quantity ?? 0),
  };
}

function extractNumericValue(payload: unknown): number {
  if (typeof payload === "number") {
    return payload;
  }

  if (typeof payload === "string") {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (!payload || typeof payload !== "object") {
    return 0;
  }

  const obj = payload as Record<string, unknown>;
  const directKeys = ["value", "total", "totalValue", "stockValue", "totalStockValue", "inventoryValue", "amount"];

  for (const key of directKeys) {
    const raw = obj[key];
    if (typeof raw === "number") {
      return raw;
    }
    if (typeof raw === "string") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  if (obj.data !== undefined) {
    return extractNumericValue(obj.data);
  }

  return 0;
}
