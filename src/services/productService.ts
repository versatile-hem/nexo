import { ProductOption } from "@/mocks/types";
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
};
