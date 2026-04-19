import { Navigate, createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProductListPage } from "@/features/inventory/pages/ProductListPage";
import { ProductFormPage } from "@/features/inventory/pages/ProductFormPage";
import { StockMovementsPage } from "@/features/inventory/pages/StockMovementsPage";
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
import { RequireRole } from "@/app/routeGuards";
import { UnauthorizedPage } from "@/features/dashboard/UnauthorizedPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";

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
      { path: "dashboard", element: <DashboardPage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/new", element: <ProductFormPage /> },
      { path: "inventory/batch", element: <BatchTrackingPage /> },
      { path: "inventory", element: <Navigate to="/inventory/stock-movements" replace /> },
      { path: "inventory/stock-movements", element: <StockMovementsPage /> },
      { path: "inventory/daily-operations", element: <DailyOperationsPage /> },
      { path: "billing", element: <InvoiceListPage /> },
      { path: "billing/create-invoice", element: <CreateInvoicePage /> },
      { path: "billing/new", element: <Navigate to="/billing/create-invoice" replace /> },
      { path: "orders", element: <OrderListPage /> },
      { path: "orders/returns", element: <ReturnHandlingPage /> },
      { path: "customers", element: <CustomerListPage /> },
      { path: "customers/:customerId", element: <CustomerProfilePage /> },
      { path: "reports", element: <ReportsPage /> },
      {
        path: "settings",
        element: (
          <RequireRole allowedRoles={["admin"]}>
            <SettingsPage />
          </RequireRole>
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
