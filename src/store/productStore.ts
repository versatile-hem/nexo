import { create } from "zustand";
import { Product } from "@/mocks/types";

interface ProductState {
  selectedProduct?: Product;
  setSelectedProduct: (product?: Product) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  selectedProduct: undefined,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
