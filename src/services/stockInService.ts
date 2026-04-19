import { db } from "@/mocks/data";
import { StockInEntry } from "@/mocks/types";
import { mockResponse } from "@/services/api";
import { operationsApi } from "@/services/operationsApi";
import { productService } from "@/services/productService";

interface RecordStockInPayload {
  productId: string;
  qty: number;
  note?: string;
}

export const stockInService = {
  recordStockIn: async (payload: RecordStockInPayload) => {
    const catalog = await productService.getProducts();
    const product = catalog.find((item) => item.id === payload.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!Number.isFinite(payload.qty) || payload.qty <= 0) {
      throw new Error("Enter a valid stock quantity");
    }

    await operationsApi.stockIn([
      {
        productId: payload.productId,
        quantity: payload.qty,
        unit: "nos",
      },
    ]);

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
