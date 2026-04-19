import { db } from "@/mocks/data";
import { StockInEntry } from "@/mocks/types";
import { inventoryService } from "@/services/inventoryService";
import { mockResponse } from "@/services/api";

interface RecordStockInPayload {
  productId: string;
  qty: number;
  note?: string;
}

export const stockInService = {
  recordStockIn: async (payload: RecordStockInPayload) => {
    const product = db.products.find((item) => item.id === payload.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!Number.isFinite(payload.qty) || payload.qty <= 0) {
      throw new Error("Enter a valid stock quantity");
    }

    await inventoryService.updateStock(payload.productId, "IN", payload.qty);

    const entry: StockInEntry = {
      id: `sin-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      qty: payload.qty,
      receivedAt: new Date().toISOString(),
      note: payload.note?.trim() || undefined,
    };

    db.stockInEntries.unshift(entry);
    return mockResponse(entry);
  },

  getEntries: () => mockResponse([...db.stockInEntries]),

  getTodayCount: (date = new Date().toISOString().slice(0, 10)) =>
    mockResponse(db.stockInEntries.filter((entry) => entry.receivedAt.slice(0, 10) === date).length),

  getLastUpdated: () => mockResponse(db.stockInEntries[0]?.receivedAt ?? null),

  hasStockInForDate: async (date: string) => {
    const count = db.stockInEntries.filter((entry) => entry.receivedAt.slice(0, 10) === date).length;
    return mockResponse(count > 0);
  },
};
