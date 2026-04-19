import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AuthRole } from "@/services/authService";

export function RequireRole({ allowedRoles, children }: PropsWithChildren<{ allowedRoles: AuthRole[] }>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
