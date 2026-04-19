import { api } from "@/services/api";

export type AuthRole = "admin" | "operation_manager" | "field_sales_executive";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  roles: AuthRole[];
}

interface LoginResponse extends AuthUser {
  token: string;
}

export const AUTH_USER_KEY = "nexo-auth-user";
export const AUTH_TOKEN_KEY = "token";

interface LoginApiResponse {
  token: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: unknown;
    roles?: unknown;
  };
  id?: number;
  name?: string;
  email?: string;
  role?: unknown;
  roles?: unknown;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password.trim()) {
      throw new Error("Invalid credentials");
    }

    const response = await api.post<LoginApiResponse>("/auth/login", {
      username: normalizedEmail,
      password,
    });

    const token = response.data?.token;
    if (!token) {
      throw new Error("Invalid login response");
    }

    const roles = normalizeRoles(response.data?.user?.roles ?? response.data?.roles, response.data?.user?.role ?? response.data?.role);
    const role = getPrimaryRole(roles);

    const sessionUser: AuthUser = {
      id: Number(response.data?.user?.id ?? response.data?.id ?? 0),
      name: response.data?.user?.name ?? response.data?.name ?? normalizedEmail,
      email: response.data?.user?.email ?? response.data?.email ?? normalizedEmail,
      role,
      roles,
    };

    const payload: LoginResponse = {
      ...sessionUser,
      token,
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);

    return payload;
  },

  logout: async () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("nexo-auth-store");
    await delay(80);
  },

  getCurrentUser: (): LoginResponse | null => {
    const userRaw = localStorage.getItem(AUTH_USER_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!userRaw || !token) {
      return null;
    }

    try {
      const user = JSON.parse(userRaw) as Partial<AuthUser>;
      const roles = normalizeRoles(user.roles, user.role);
      const role = getPrimaryRole(roles);
      return {
        id: Number(user.id ?? 0),
        name: user.name ?? "User",
        email: user.email ?? "",
        role,
        roles,
        token,
      };
    } catch {
      return null;
    }
  },
};

function normalizeRoles(roles?: unknown, role?: unknown): AuthRole[] {
  const normalized = new Set<AuthRole>();

  const pushRole = (value: unknown) => {
    const mapped = mapRoleValue(value);
    if (mapped) {
      normalized.add(mapped);
    }
  };

  if (Array.isArray(roles)) {
    roles.forEach((item) => {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        pushRole(record.role);
        pushRole(record.name);
        pushRole(record.authority);
        return;
      }
      pushRole(item);
    });
  } else {
    pushRole(roles);
  }

  if (normalized.size === 0) {
    pushRole(role);
  }

  if (normalized.size === 0) {
    normalized.add("operation_manager");
  }

  return Array.from(normalized);
}

function mapRoleValue(value: unknown): AuthRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/^role[_:\-]?/, "");

  if (normalized === "admin") return "admin";
  if (normalized === "operation_manager" || normalized === "operationmanager" || normalized === "ops_manager" || normalized === "ops") {
    return "operation_manager";
  }
  if (normalized === "field_sales_executive" || normalized === "fieldsalesexecutive" || normalized === "field_sales" || normalized === "fse") {
    return "field_sales_executive";
  }

  return null;
}

function getPrimaryRole(roles: AuthRole[]): AuthRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("operation_manager")) return "operation_manager";
  return "field_sales_executive";
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
