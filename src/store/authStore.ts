import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService, AuthRole, AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: AuthRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: AuthRole) => void;
}

const initialSession = authService.getCurrentUser();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: initialSession
        ? {
            id: initialSession.id,
            name: initialSession.name,
            email: initialSession.email,
            role: initialSession.role,
          }
        : null,
      token: initialSession?.token ?? null,
      role: initialSession?.role ?? null,
      isAuthenticated: Boolean(initialSession?.token),

      login: async (email, password) => {
        const session = await authService.login(email, password);
        set({
          user: {
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
          },
          token: session.token,
          role: session.role,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        await authService.logout();
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        });
      },

      setRole: (role) =>
        set((state) => ({
          role,
          user: state.user ? { ...state.user, role } : state.user,
        })),
    }),
    {
      name: "nexo-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
