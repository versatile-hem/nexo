import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/States";
import { formatCurrency } from "@/utils/format";
import { orderService } from "@/services/orderService";

export function OrderListPage() {
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: orderService.getOrders, refetchInterval: 9000 });
  const orders = ordersQuery.data ?? [];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Orders</h2>
        <Link className="text-sm text-nexo-accent underline" to="/orders/returns">Open Return Handling</Link>
      </div>
      {orders.length === 0 ? (
        <EmptyState title="No orders" subtitle="Orders will be listed here." />
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase opacity-70">
              <th className="p-2">Order ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.customer}</td>
                <td className="p-2">
                  <span className="rounded-full bg-black/5 px-2 py-1 text-xs dark:bg-white/10">{order.status}</span>
                </td>
                <td className="p-2">{formatCurrency(order.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
