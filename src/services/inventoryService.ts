import { db } from "@/mocks/data";
import { Product, StockMovementType, StockMovement } from "@/mocks/types";
import { api, mockResponse } from "@/services/api";
import { operationsApi, StockInLineItem } from "@/services/operationsApi";
import { productsApi, UpsertProductPayload } from "@/services/productsApi";

interface StockMovementRequest {
  productId: string;
  quantity: number;
  type: StockMovementType;
}

export const inventoryService = {
  getProducts: async (): Promise<Product[]> => {
    const products = await productsApi.list();
    return products.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
      price: item.price,
      stock: item.stock,
      category: item.category,
      batchCode: undefined,
    }));
  },

  createProduct: async (payload: Omit<Product, "id">) => {
    const product = await productsApi.create(toUpsertPayload(payload));
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      stock: product.stock,
      category: product.category,
      batchCode: payload.batchCode,
    } satisfies Product;
  },

  updateStock: async (productId: string, type: "IN" | "OUT", qty: number) => {
    if (type === "IN") {
      await operationsApi.stockIn([{ productId, quantity: qty, unit: "nos" }]);
    } else {
      await operationsApi.dailyOperation({
        type: "ORDER",
        productId,
        quantity: qty,
        unit: "nos",
        channel: "Offline",
      });
    }

    const updated = await productsApi.getById(productId);
    return {
      id: updated.id,
      name: updated.name,
      sku: updated.sku,
      barcode: updated.barcode,
      price: updated.price,
      stock: updated.stock,
      category: updated.category,
      batchCode: undefined,
    } satisfies Product;
  },

  createStockMovements: async (movements: StockMovementRequest[]) => {
    const inMovements = movements.filter((m) => m.type === "IN");
    const outMovements = movements.filter((m) => m.type === "OUT");

    const results = [];

    // Process stock in movements
    if (inMovements.length > 0) {
      const inItems: StockInLineItem[] = inMovements.map((m) => ({
        productId: m.productId,
        quantity: m.quantity,
        unit: "nos",
      }));
      const inResults = await operationsApi.stockIn(inItems);
      results.push(...inResults);
    }

    // Process stock out movements
    if (outMovements.length > 0) {
      for (const movement of outMovements) {
        const result = await operationsApi.dailyOperation({
          type: "ORDER",
          productId: movement.productId,
          quantity: movement.quantity,
          unit: "nos",
          channel: "Offline",
        });
        results.push(result);
      }
    }

    return results;
  },

  getStockMovements: async (): Promise<StockMovement[]> => {
    try {
      const response = await api.get<StockMovement[]>("/stock-movements");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      // Fallback to mock data if API fails
      return mockResponse([...db.stockMovements]);
    }
  },

  getStockMovementsFiltered: async (
    type?: "IN" | "OUT",
    startDate?: string,
    endDate?: string,
    page = 0,
    size = 20,
  ) => {
    try {
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", String(page));
      params.append("size", String(size));

      const response = await api.get(`/stock-movements?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Log error for debugging
      console.error("Stock movements API error:", error);
      // Return mock data as fallback
      return {
        content: [...db.stockMovements],
        pageNumber: 0,
        pageSize: 20,
        totalElements: db.stockMovements.length,
        totalPages: 1,
        last: true,
      };
    }
  },
};

function toUpsertPayload(payload: Omit<Product, "id">): UpsertProductPayload {
  return {
    name: payload.name,
    sku: payload.sku,
    barcode: payload.barcode,
    price: payload.price,
    category: payload.category,
    availableStock: payload.stock,
  };
}
