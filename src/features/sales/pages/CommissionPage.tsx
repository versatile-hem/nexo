import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/States";
import { commissionService } from "@/services/commissionService";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function CommissionPage() {
  const user = useAuthStore((state) => state.user);
  const [month, setMonth] = useState(currentMonth());

  const commissionQuery = useQuery({
    queryKey: ["commission", month, user?.name],
    queryFn: () => commissionService.getMonthlyCommission(month, user?.name ?? ""),
  });

  const breakdown = commissionQuery.data?.breakdown ?? [];

  const paidTotal = useMemo(() => breakdown.reduce((sum, row) => sum + row.paidAmount, 0), [breakdown]);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">My Commission</h2>
        <p className="mt-1 text-sm opacity-70">Monthly commission with order-wise breakdown.</p>
      </Card>

      <Card className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="mb-1 text-xs uppercase opacity-70">Month</p>
          <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-black/10 p-3 dark:border-white/20">
            <p className="text-xs uppercase opacity-70">Total Paid Sales</p>
            <p className="mt-1 text-xl font-bold">{formatCurrency(paidTotal)}</p>
          </div>
          <div className="rounded-xl border border-nexo-accent/40 bg-nexo-accent/5 p-3">
            <p className="text-xs uppercase opacity-70">Total Commission</p>
            <p className="mt-1 text-xl font-bold text-nexo-accent">{formatCurrency(commissionQuery.data?.totalCommission ?? 0)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold">Order-wise Breakdown</h3>
        {breakdown.length === 0 ? (
          <EmptyState title="No commission entries" subtitle="No paid orders found for selected month." />
        ) : (
          <ul className="mt-3 space-y-2">
            {breakdown.map((item) => (
              <li key={item.orderNumber} className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/20">
                <p className="font-semibold">{item.orderNumber}</p>
                <p className="text-xs opacity-70">{item.customerName}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs opacity-70">Paid: {formatCurrency(item.paidAmount)}</span>
                  <span className="font-semibold text-nexo-accent">{formatCurrency(item.commission)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
