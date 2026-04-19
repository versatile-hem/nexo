import { Navigate, createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { OperationDashboard } from "@/features/dashboard/OperationDashboard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProductListPage } from "@/features/inventory/pages/ProductListPage";
import { ProductFormPage } from "@/features/inventory/pages/ProductFormPage";
import { StockMovementsPage } from "@/features/inventory/pages/StockMovementsPage";
import { StockInPage } from "@/features/inventory/pages/StockInPage";
import { BatchTrackingPage } from "@/features/inventory/pages/BatchTrackingPage";
import { DailyOperationsPage } from "@/features/inventory/pages/DailyOperationsPage";
import { InvoiceListPage } from "@/features/billing/pages/InvoiceListPage";
import { CreateInvoicePage } from "@/features/billing/pages/CreateInvoicePage";
import { CustomerListPage } from "@/features/customers/pages/CustomerListPage";
import { CustomerProfilePage } from "@/features/customers/pages/CustomerProfilePage";
import { OrderListPage } from "@/features/orders/pages/OrderListPage";
import { ReturnHandlingPage } from "@/features/orders/pages/ReturnHandlingPage";
import { ReportsPage } from "@/features/dashboard/ReportsPage";
import { SettingsPage } from "@/features/dashboard/SettingsPage";
import { UnauthorizedPage } from "@/features/dashboard/UnauthorizedPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { isAdmin } from "@/utils/roleUtils";

export const appRouter = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <RootRedirect /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <RoleAwareDashboard /> },
      {
        path: "products",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProductListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "products/new",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProductFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "inventory/batch",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <BatchTrackingPage />
          </ProtectedRoute>
        ),
      },
      { path: "inventory", element: <InventoryRootRedirect /> },
      {
        path: "inventory/stock-movements",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <StockMovementsPage />
          </ProtectedRoute>
        ),
      },
      { path: "inventory/stock-in", element: <StockInPage /> },
      { path: "inventory/daily-operations", element: <DailyOperationsPage /> },
      {
        path: "billing",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <InvoiceListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "billing/create-invoice",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateInvoicePage />
          </ProtectedRoute>
        ),
      },
      { path: "billing/new", element: <Navigate to="/billing/create-invoice" replace /> },
      {
        path: "orders",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <OrderListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/returns",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ReturnHandlingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "customers",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CustomerListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "customers/:customerId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CustomerProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function RoleAwareDashboard() {
  const role = useAuthStore((state) => state.role);
  return isAdmin(role) ? <DashboardPage /> : <OperationDashboard />;
}

function InventoryRootRedirect() {
  const role = useAuthStore((state) => state.role);
  return <Navigate to={isAdmin(role) ? "/inventory/stock-movements" : "/inventory/stock-in"} replace />;
}
