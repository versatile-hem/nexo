import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AuthRole } from "@/services/authService";

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles?: AuthRole[];
  unauthorizedTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, unauthorizedTo = "/dashboard" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={unauthorizedTo} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
