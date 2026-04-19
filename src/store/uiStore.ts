import { create } from "zustand";

interface UIState {
  isSidebarCollapsed: boolean;
  darkMode: boolean;
  globalSearch: string;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setGlobalSearch: (value: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  darkMode: false,
  globalSearch: "",
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      document.body.classList.toggle("dark", next);
      return { darkMode: next };
    }),
  setGlobalSearch: (value) => set({ globalSearch: value }),
}));
