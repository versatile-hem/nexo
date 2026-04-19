import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/States";
import { salesService } from "@/services/salesService";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";

export function MyOrdersPage() {
  const user = useAuthStore((state) => state.user);

  const ordersQuery = useQuery({
    queryKey: ["sales-orders", user?.name],
    queryFn: () => salesService.listMyOrders(user?.name ?? ""),
  });

  const rows = ordersQuery.data ?? [];

  const unpaidCount = useMemo(() => rows.filter((item) => item.paymentStatus !== "PAID").length, [rows]);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">My Orders</h2>
            <p className="text-sm opacity-70">Track payment status and outstanding collections.</p>
          </div>
          <Link to="/sales/create-order"><Button className="h-11">Take Order</Button></Link>
        </div>
      </Card>

      {rows.length === 0 ? (
        <Card><EmptyState title="No orders yet" subtitle="Create your first sales order." /></Card>
      ) : (
        <div className="space-y-3">
          <Card className="p-3 text-sm">
            <p className="opacity-70">Unpaid / Partial Orders</p>
            <p className="text-2xl font-bold text-red-600">{unpaidCount}</p>
          </Card>

          {rows.map((order) => {
            const progress = order.amount > 0 ? Math.min(100, Math.round((order.paidAmount / order.amount) * 100)) : 0;
            const unpaid = order.paymentStatus !== "PAID";

            return (
              <Card
                key={order.id}
                className={unpaid ? "border-2 border-red-200 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-900/10" : "p-4"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{order.orderNumber}</p>
                    <p className="text-xs opacity-70">{order.customerName}</p>
                  </div>
                  <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10">{order.paymentStatus}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs opacity-70">Amount</p>
                    <p className="font-semibold">{formatCurrency(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Paid</p>
                    <p className="font-semibold">{formatCurrency(order.paidAmount)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                    <div className="h-full rounded-full bg-nexo-accent" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs opacity-70">Payment Progress: {progress}%</p>
                </div>

                <div className="mt-3">
                  <Link to={`/sales/payments?orderId=${encodeURIComponent(order.id)}`}><Button variant="secondary" className="h-10 w-full">Track Payment</Button></Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
