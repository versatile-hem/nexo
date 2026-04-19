import { create } from "zustand";
import {
  DailyOpsOrderRow,
  DailyOpsReturnRow,
  DailyOpsUnit,
  SalesChannel,
} from "@/mocks/types";

const defaultOrder = (): DailyOpsOrderRow => ({
  courier: "",
  productId: undefined,
  productName: "",
  qty: 1,
  unit: "nos",
});

const defaultReturn = (): DailyOpsReturnRow => ({
  courier: "",
  productId: undefined,
  productName: "",
  qty: 1,
  unit: "nos",
});

interface DailyOpsState {
  date: string;
  channel: SalesChannel;
  orders: DailyOpsOrderRow[];
  returns: DailyOpsReturnRow[];
  setDate: (date: string) => void;
  setChannel: (channel: SalesChannel) => void;
  setOrders: (orders: DailyOpsOrderRow[]) => void;
  setReturns: (returns: DailyOpsReturnRow[]) => void;
  addOrderRow: () => void;
  addReturnRow: () => void;
  updateOrderRow: (index: number, patch: Partial<DailyOpsOrderRow>) => void;
  updateReturnRow: (index: number, patch: Partial<DailyOpsReturnRow>) => void;
  removeOrderRow: (index: number) => void;
  removeReturnRow: (index: number) => void;
  setUnitForAll: (unit: DailyOpsUnit) => void;
  reset: () => void;
}

export const useDailyOpsStore = create<DailyOpsState>((set) => ({
  date: new Date().toISOString().slice(0, 10),
  channel: "Meesho",
  orders: [defaultOrder()],
  returns: [defaultReturn()],
  setDate: (date) => set({ date }),
  setChannel: (channel) => set({ channel }),
  setOrders: (orders) => set({ orders }),
  setReturns: (returns) => set({ returns }),
  addOrderRow: () => set((state) => ({ orders: [...state.orders, defaultOrder()] })),
  addReturnRow: () => set((state) => ({ returns: [...state.returns, defaultReturn()] })),
  updateOrderRow: (index, patch) =>
    set((state) => ({
      orders: state.orders.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    })),
  updateReturnRow: (index, patch) =>
    set((state) => ({
      returns: state.returns.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    })),
  removeOrderRow: (index) =>
    set((state) => ({
      orders: state.orders.length <= 1 ? state.orders : state.orders.filter((_, i) => i !== index),
    })),
  removeReturnRow: (index) =>
    set((state) => ({
      returns: state.returns.length <= 1 ? state.returns : state.returns.filter((_, i) => i !== index),
    })),
  setUnitForAll: (unit) =>
    set((state) => ({
      orders: state.orders.map((row) => ({ ...row, unit })),
      returns: state.returns.map((row) => ({ ...row, unit })),
    })),
  reset: () =>
    set({
      date: new Date().toISOString().slice(0, 10),
      channel: "Meesho",
      orders: [defaultOrder()],
      returns: [defaultReturn()],
    }),
}));
