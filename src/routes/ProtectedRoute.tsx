import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AUTH_TOKEN_KEY, AuthRole } from "@/services/authService";
import { hasAnyRole } from "@/utils/roleUtils";

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles?: AuthRole[];
  unauthorizedTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, unauthorizedTo = "/dashboard" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const roles = useAuthStore((state) => state.roles);
  const location = useLocation();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roleInput = Array.isArray(roles) && roles.length > 0 ? roles : role;

  if (allowedRoles && !hasAnyRole(roleInput, allowedRoles)) {
    return <Navigate to={unauthorizedTo} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
