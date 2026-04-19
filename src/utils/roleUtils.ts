import { AuthRole } from "@/services/authService";

export function isAdmin(role: AuthRole | null | undefined) {
  return role === "admin";
}

export function isOperationManager(role: AuthRole | null | undefined) {
  return role === "operation_manager";
}
