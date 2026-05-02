import { Product, ProductOption } from "@/mocks/types";
import { productsApi } from "@/services/productsApi";

export const productService = {
  getProducts: async (): Promise<ProductOption[]> => {
    const products = await productsApi.list();
    return products.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
    }));
  },

  getProductById: async (id: string): Promise<Product> => {
    const product = await productsApi.getById(id);
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      stock: product.stock,
      category: product.category,
    };
  },
};
