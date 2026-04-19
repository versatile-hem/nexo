import axios from "axios";
import { AUTH_TOKEN_KEY } from "@/services/authService";
import { mapHttpError } from "@/services/httpErrors";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.set("Authorization", `Basic ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(mapHttpError(error)),
);

export function mockResponse<T>(data: T, delay = 300): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delay);
  });
}
