import { ProductOption } from "@/mocks/types";
import { mockResponse } from "@/services/api";

const mockCatalog: ProductOption[] = [
  { id: "1", name: "Ebook", sku: "EBK-01", barcode: "8901234567890" },
  { id: "2", name: "Pink potty seat non foldable", sku: "PPS-01", barcode: "8909876543210" },
  { id: "3", name: "Electric socket white 12 vale", sku: "ES-12", barcode: "8905678901234" },
];

export const productService = {
  getProducts: () => mockResponse([...mockCatalog]),
};
