export type AuthRole = "admin" | "operation_manager";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
}

interface LoginResponse extends AuthUser {
  token: string;
}

const AUTH_USER_KEY = "nexo-auth-user";
export const AUTH_TOKEN_KEY = "nexo-auth-token";
export const AUTH_CREDENTIALS_KEY = "nexo-auth-credentials";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password.trim()) {
      throw new Error("Invalid credentials");
    }

    const token = toBasicToken(normalizedEmail, password);
    const role = await resolveRoleFromBackend(token, normalizedEmail);

    const sessionUser: AuthUser = {
      id: role === "admin" ? 1 : 2,
      name: role === "admin" ? "Admin User" : "Ops Manager",
      email: normalizedEmail,
      role,
    };

    const payload: LoginResponse = {
      ...sessionUser,
      token,
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email: normalizedEmail, password }));

    return payload;
  },

  logout: async () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CREDENTIALS_KEY);
    await delay(80);
  },

  getCurrentUser: (): LoginResponse | null => {
    const userRaw = localStorage.getItem(AUTH_USER_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!userRaw || !token) {
      return null;
    }

    try {
      const user = JSON.parse(userRaw) as AuthUser;
      return { ...user, token };
    } catch {
      return null;
    }
  },
};

function toBasicToken(email: string, password: string) {
  return btoa(`${email}:${password}`);
}

async function resolveRoleFromBackend(token: string, email: string): Promise<AuthRole> {
  // Capability probe: billing clients endpoint is expected to be admin-only.
  // 200 => ADMIN, 403 => OPERATION_MANAGER.
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/client`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${token}`,
      },
    });

    if (response.status === 200) {
      return "admin";
    }

    if (response.status === 403) {
      return "operation_manager";
    }

    if (response.status === 401) {
      throw new Error("Invalid credentials");
    }

    // If client endpoint is unavailable in env, verify auth against product endpoint.
    const productsResponse = await fetch(`${getApiBaseUrl()}/api/products`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${token}`,
      },
    });

    if (productsResponse.status === 401) {
      throw new Error("Invalid credentials");
    }

    if (productsResponse.status === 200 || productsResponse.status === 403) {
      return "operation_manager";
    }
  } catch {
    throw new Error("Unable to authenticate with server");
  }

  return email.toLowerCase().includes("ops") ? "operation_manager" : "admin";
}

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
