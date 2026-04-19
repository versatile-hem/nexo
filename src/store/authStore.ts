import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService, AuthRole, AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: AuthRole | null;
  roles: AuthRole[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: AuthRole) => void;
  setRoles: (roles: AuthRole[]) => void;
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
            roles: initialSession.roles,
          }
        : null,
      token: initialSession?.token ?? null,
      role: initialSession?.role ?? null,
      roles: initialSession?.roles ?? (initialSession?.role ? [initialSession.role] : []),
      isAuthenticated: Boolean(initialSession?.token),

      login: async (email, password) => {
        const session = await authService.login(email, password);
        set({
          user: {
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
            roles: session.roles,
          },
          token: session.token,
          role: session.role,
          roles: session.roles,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        await authService.logout();
        set({
          user: null,
          token: null,
          role: null,
          roles: [],
          isAuthenticated: false,
        });
      },

      setRole: (role) =>
        set((state) => ({
          role,
          roles: state.roles.includes(role) ? state.roles : [...state.roles, role],
          user: state.user
            ? {
                ...state.user,
                role,
                roles: state.roles.includes(role) ? state.roles : [...state.roles, role],
              }
            : state.user,
        })),

      setRoles: (roles) =>
        set((state) => ({
          roles,
          role: roles[0] ?? null,
          user: state.user
            ? {
                ...state.user,
                roles,
                role: roles[0] ?? state.user.role,
              }
            : state.user,
        })),
    }),
    {
      name: "nexo-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
