import { ProductOption } from "@/mocks/types";
import { mockResponse } from "@/services/api";

const mockCatalog: ProductOption[] = [
  { id: "1", name: "Ebook", sku: "EBK-01" },
  { id: "2", name: "Pink potty seat non foldable", sku: "PPS-01" },
  { id: "3", name: "Electric socket white 12 vale", sku: "ES-12" },
];

export const productService = {
  getProducts: () => mockResponse([...mockCatalog]),
};
