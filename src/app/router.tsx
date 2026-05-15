import { Navigate, createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { OperationDashboard } from "@/features/dashboard/OperationDashboard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProductListPage } from "@/features/inventory/pages/ProductListPage";
import { ProductFormPage } from "@/features/inventory/pages/ProductFormPage";
import { ProductDetailsPage } from "@/features/inventory/pages/ProductDetailsPage";
import { StockMovementsPage } from "@/features/inventory/pages/StockMovementsPage";
import { StockMovementPage } from "@/features/inventory/pages/StockMovementPage";
import { StockInPage } from "@/features/inventory/pages/StockInPage";
import { BatchTrackingPage } from "@/features/inventory/pages/BatchTrackingPage";
import { DailyOperationsPage } from "@/features/inventory/pages/DailyOperationsPage";
import { InventoryLookupPage } from "@/features/inventory/pages/InventoryLookupPage";
import { InvoiceListPage } from "@/features/billing/pages/InvoiceListPage";
import { CreateInvoicePage } from "@/features/billing/pages/CreateInvoicePage";
import { BillingIntegrationPage } from "@/features/billing/pages/BillingIntegrationPage";
import { CreateOrderPage } from "@/features/sales/pages/CreateOrderPage";
import { MyOrdersPage } from "@/features/sales/pages/MyOrdersPage";
import { PaymentsPage } from "@/features/sales/pages/PaymentsPage";
import { CommissionPage } from "@/features/sales/pages/CommissionPage";
import { CustomerListPage } from "@/features/customers/pages/CustomerListPage";
import { CustomerProfilePage } from "@/features/customers/pages/CustomerProfilePage";
import { OrderListPage } from "@/features/orders/pages/OrderListPage";
import { ReturnHandlingPage } from "@/features/orders/pages/ReturnHandlingPage";
import { ReportsPage } from "@/features/dashboard/ReportsPage";
import { SettingsPage } from "@/features/dashboard/SettingsPage";
import { UnauthorizedPage } from "@/features/dashboard/UnauthorizedPage";
import { AnalyticsHome } from "@/features/analytics/pages/AnalyticsHome";
import { UploadWorkflow } from "@/features/analytics/pages/UploadWorkflow";
import { HistoricalDashboard } from "@/features/analytics/pages/HistoricalDashboard";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { isAdmin, isFieldSalesExecutive } from "@/utils/roleUtils";

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
        path: "products/:productId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProductDetailsPage />
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
        path: "products/:productId/edit",
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
          <ProtectedRoute allowedRoles={["admin", "operation_manager"]}>
            <StockMovementsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "inventory/stock-movement",
        element: <StockMovementPage />,
      },
      {
        path: "inventory/lookup",
        element: (
          <ProtectedRoute allowedRoles={["admin", "operation_manager"]}>
            <InventoryLookupPage />
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
      {
        path: "billing/integration",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <BillingIntegrationPage />
          </ProtectedRoute>
        ),
      },
      { path: "billing/new", element: <Navigate to="/billing/create-invoice" replace /> },
      {
        path: "sales/create-order",
        element: (
          <ProtectedRoute allowedRoles={["field_sales_executive", "admin"]}>
            <CreateOrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sales/orders",
        element: (
          <ProtectedRoute allowedRoles={["field_sales_executive", "admin"]}>
            <MyOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sales/payments",
        element: (
          <ProtectedRoute allowedRoles={["field_sales_executive", "admin"]}>
            <PaymentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sales/commission",
        element: (
          <ProtectedRoute allowedRoles={["field_sales_executive", "admin"]}>
            <CommissionPage />
          </ProtectedRoute>
        ),
      },
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
      {
        path: "inventory-insights",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AnalyticsHome />
          </ProtectedRoute>
        ),
        children: [
          { path: "upload", element: <UploadWorkflow /> },
          { path: "history", element: <HistoricalDashboard /> },
          { index: true, element: <Navigate to="upload" replace /> },
        ],
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
  const roles = useAuthStore((state) => state.roles);
  const roleInput = roles.length > 0 ? roles : role;
  return isAdmin(roleInput) ? <DashboardPage /> : <OperationDashboard />;
}

function InventoryRootRedirect() {
  const role = useAuthStore((state) => state.role);
  const roles = useAuthStore((state) => state.roles);
  const roleInput = roles.length > 0 ? roles : role;

  if (isAdmin(roleInput)) {
    return <Navigate to="/inventory/stock-movements" replace />;
  }

  if (isFieldSalesExecutive(roleInput)) {
    return <Navigate to="/sales/create-order" replace />;
  }

  return <Navigate to="/inventory/stock-in" replace />;
}
