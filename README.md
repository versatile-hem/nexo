# Nexo SPA

Billing, Inventory, Insights. One system.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- Zustand state stores
- TanStack Query for data fetching
- Axios API base layer with interceptors
- Recharts analytics
- Sonner toast notifications

## Features

- Collapsible sidebar and topbar with search, notifications, profile menu
- Dashboard KPIs and charts
- Inventory: products, stock movements, lot/batch tracking, stock in/out, CSV export
- Billing: invoice list and GST-ready invoice creator with auto totals
- Customers: list, profile, transaction history
- Orders: list with status and return handling UI
- Mock API service layer with Promise-based responses
- Real-time simulation for stock and order status updates
- Dark mode toggle and role-based UI placeholder

## Architecture

```text
src/
  app/
  components/
  features/
    dashboard/
    inventory/
    billing/
    customers/
    orders/
  services/
  store/
  hooks/
  utils/
  mocks/
  layouts/
```

## Run

1. Install Node.js 20+ and npm.
2. Install dependencies:
   npm install
3. Start development server:
   npm run dev
4. Build for production:
   npm run build

## API Swap Guidance

- Base client: src/services/api.ts
- Feature services isolate data access and can be pointed to real REST endpoints.
- Mock persistence is currently in src/mocks/data.ts.

## Future-Ready Hooks

- Tenant and role headers are attached in Axios request interceptor.
- Auth store is isolated in src/store/authStore.ts.
- Settings page contains role placeholder for access control expansion.
