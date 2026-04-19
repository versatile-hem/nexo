import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 4000,
});

api.interceptors.request.use((config) => {
  config.headers.set("x-tenant-id", "demo-tenant");
  config.headers.set("x-role", "admin");
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export function mockResponse<T>(data: T, delay = 300): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delay);
  });
}
