import { create } from "zustand";

interface OrderState {
  selectedOrderId?: string;
  setSelectedOrderId: (orderId?: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  selectedOrderId: undefined,
  setSelectedOrderId: (selectedOrderId) => set({ selectedOrderId }),
}));
