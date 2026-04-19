import { db } from "@/mocks/data";
import { Product, StockMovement } from "@/mocks/types";
import { mockResponse } from "@/services/api";

export const inventoryService = {
  getProducts: () => mockResponse([...db.products]),

  createProduct: (payload: Omit<Product, "id">) => {
    const product: Product = { ...payload, id: `p-${Date.now()}` };
    db.products.unshift(product);
    return mockResponse(product);
  },

  updateStock: (productId: string, type: "IN" | "OUT", qty: number) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      return Promise.reject(new Error("Product not found"));
    }
    product.stock += type === "IN" ? qty : -qty;
    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId,
      product: product.name,
      type,
      qty,
      date: new Date().toISOString().slice(0, 10),
    };
    db.stockMovements.unshift(movement);
    return mockResponse(product);
  },

  getStockMovements: () => mockResponse([...db.stockMovements]),
};
