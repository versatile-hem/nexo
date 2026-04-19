import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/States";
import { formatCurrency } from "@/utils/format";
import { inventoryService } from "@/services/inventoryService";
import { orderService } from "@/services/orderService";

const salesTrend = [
  { name: "Mon", sales: 900 },
  { name: "Tue", sales: 1350 },
  { name: "Wed", sales: 1170 },
  { name: "Thu", sales: 1480 },
  { name: "Fri", sales: 1640 },
  { name: "Sat", sales: 1800 },
  { name: "Sun", sales: 1560 },
];

const channelRevenue = [
  { name: "Online", value: 6200 },
  { name: "Retail", value: 3900 },
  { name: "Wholesale", value: 2800 },
];

export function DashboardPage() {
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: inventoryService.getProducts });
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: orderService.getOrders });

  if (productsQuery.isLoading || ordersQuery.isLoading) {
    return (
      <div className="grid-cards">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  if (productsQuery.error || ordersQuery.error) {
    return <ErrorState message="Could not load dashboard insights" onRetry={() => window.location.reload()} />;
  }

  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const lowStock = products.filter((product) => product.stock < 10).length;
  const profit = totalRevenue * 0.24;

  return (
    <div className="space-y-4">
      <div className="grid-cards">
        <Kpi title="Total Revenue" value={formatCurrency(totalRevenue)} />
        <Kpi title="Orders Today" value={`${orders.length}`} />
        <Kpi title="Low Stock Items" value={`${lowStock}`} />
        <Kpi title="Profit" value={formatCurrency(profit)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#2c7a4b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold">Channel Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={channelRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2c7a4b" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide opacity-60">{title}</p>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </Card>
  );
}
