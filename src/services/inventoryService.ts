import { db } from "@/mocks/data";
import { Product } from "@/mocks/types";
import { mockResponse } from "@/services/api";
import { operationsApi } from "@/services/operationsApi";
import { productsApi, UpsertProductPayload } from "@/services/productsApi";

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

  getStockMovements: () => mockResponse([...db.stockMovements]),
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
