import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AuthRole } from "@/services/authService";
import { hasAnyRole } from "@/utils/roleUtils";

export function RequireRole({ allowedRoles, children }: PropsWithChildren<{ allowedRoles: AuthRole[] }>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const roles = useAuthStore((state) => state.roles);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roleInput = Array.isArray(roles) && roles.length > 0 ? roles : role;

  if (!hasAnyRole(roleInput, allowedRoles)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
