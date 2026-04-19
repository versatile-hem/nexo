import { AxiosError } from "axios";

export type ApiErrorCode = "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER" | "NETWORK";

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;

  constructor(message: string, code: ApiErrorCode, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function mapHttpError(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return new ApiError("Network error. Please retry.", "NETWORK");
  }

  const status = error.response?.status;
  const backendMessage =
    (error.response?.data as { message?: string } | undefined)?.message ||
    (error.response?.data as { error?: string } | undefined)?.error;

  if (status === 400) return new ApiError(backendMessage || "Validation failed.", "VALIDATION", status);
  if (status === 401) return new ApiError("Unauthorized. Please login again.", "UNAUTHORIZED", status);
  if (status === 403) return new ApiError("Access denied for your role.", "FORBIDDEN", status);
  if (status === 404) return new ApiError("Requested resource not found.", "NOT_FOUND", status);
  if (status && status >= 500) return new ApiError("Server error. Please try again later.", "SERVER", status);

  return new ApiError(backendMessage || "Request failed.", "NETWORK", status);
}
