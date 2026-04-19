import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightTile } from "@/features/dashboard/components/InsightTile";
import { inventoryApi } from "@/services/inventoryApi";

const lowStockFallback = [{ name: "Ebook", qty: 5 }];
const stockValueFallback = 125000;
const topProductsFallback = [{ name: "Socket", qty: 500 }];

export function InventoryInsights() {
  const navigate = useNavigate();

  const lowStockQuery = useQuery({
    queryKey: ["inventory-insights", "low-stock"],
    queryFn: async () => {
      try {
        return { rows: await inventoryApi.getLowStock(), fallback: false };
      } catch {
        return { rows: lowStockFallback, fallback: true };
      }
    },
  });

  const stockValueQuery = useQuery({
    queryKey: ["inventory-insights", "stock-value"],
    queryFn: async () => {
      try {
        return { value: await inventoryApi.getStockValue(), fallback: false };
      } catch {
        return { value: stockValueFallback, fallback: true };
      }
    },
  });

  const topProductsQuery = useQuery({
    queryKey: ["inventory-insights", "top-products"],
    queryFn: async () => {
      try {
        return { rows: await inventoryApi.getTopProducts(), fallback: false };
      } catch {
        return { rows: topProductsFallback, fallback: true };
      }
    },
  });

  const loading = lowStockQuery.isLoading || stockValueQuery.isLoading || topProductsQuery.isLoading;

  if (loading) {
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">📊 Inventory Insights</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </section>
    );
  }

  const lowStockRows = lowStockQuery.data?.rows ?? lowStockFallback;
  const stockValue = stockValueQuery.data?.value ?? stockValueFallback;
  const topProductsRows = (topProductsQuery.data?.rows ?? topProductsFallback).slice(0, 5);

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">📊 Inventory Insights</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InsightTile
          title="⚠️ Low Stock"
          subtitle={lowStockQuery.data?.fallback ? "Using fallback data" : undefined}
          tone="warning"
          onClick={() => navigate("/inventory/lookup")}
        >
          <p className="text-3xl font-bold">{lowStockRows.length}</p>
          <ul className="space-y-1 text-sm">
            {lowStockRows.slice(0, 3).map((item, idx) => (
              <li key={`${item.name}-${idx}`} className="flex items-center justify-between">
                <span className="truncate pr-2">{item.name}</span>
                <span className="font-semibold">{item.qty}</span>
              </li>
            ))}
          </ul>
        </InsightTile>

        <InsightTile
          title="💰 Total Stock Value"
          subtitle={stockValueQuery.data?.fallback ? "Using fallback data" : undefined}
          tone="success"
          onClick={() => navigate("/inventory/stock-movements")}
        >
          <p className="text-3xl font-bold">{formatInr(stockValue)}</p>
          <p className="text-xs opacity-70">Current estimated inventory valuation</p>
        </InsightTile>

        <InsightTile
          title="🏆 Top Products"
          subtitle={topProductsQuery.data?.fallback ? "Using fallback data" : undefined}
          onClick={() => navigate("/products")}
        >
          <ul className="space-y-1 text-sm">
            {topProductsRows.map((item, idx) => (
              <li key={`${item.name}-${idx}`} className="flex items-center justify-between">
                <span className="truncate pr-2">{item.name}</span>
                <span className="font-semibold">{item.qty}</span>
              </li>
            ))}
          </ul>
        </InsightTile>
      </div>
    </section>
  );
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
