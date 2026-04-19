export type AuthRole = "admin" | "manager" | "staff";

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
const AUTH_TOKEN_KEY = "nexo-auth-token";

const MOCK_CREDENTIALS = {
  email: "admin@nexo.com",
  password: "admin123",
};

const MOCK_USER: AuthUser = {
  id: 1,
  name: "Admin User",
  email: "admin@nexo.com",
  role: "admin",
};

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await delay(450);

    if (email.toLowerCase().trim() !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
      throw new Error("Invalid credentials");
    }

    const payload: LoginResponse = {
      ...MOCK_USER,
      token: "mock-jwt-token",
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(MOCK_USER));
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);

    return payload;
  },

  logout: async () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
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

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
