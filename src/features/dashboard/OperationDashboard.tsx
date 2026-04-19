import { ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, CreditCard, Inbox, MoveRight, Percent, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dailyOpsService } from "@/services/dailyOpsService";
import { stockInService } from "@/services/stockInService";
import { useAuthStore } from "@/store/authStore";
import { isFieldSalesExecutive, isOperationManager } from "@/utils/roleUtils";

export function OperationDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const roles = useAuthStore((state) => state.roles);
  const roleInput = roles.length > 0 ? roles : role;
  const opsView = isOperationManager(roleInput);
  const fseView = isFieldSalesExecutive(roleInput);

  const reportsQuery = useQuery({ queryKey: ["daily-reports"], queryFn: dailyOpsService.getDailyReports });
  const stockInQuery = useQuery({ queryKey: ["operation-dashboard-stockin"], queryFn: stockInService.getEntries });

  const summary = useMemo(() => {
    const reports = reportsQuery.data ?? [];
    const stockIns = stockInQuery.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = reports.filter((report) => report.date === today).length;
    const todayStockInCount = stockIns.filter((entry) => entry.receivedAt.slice(0, 10) === today).length;
    const stockInLatest = stockIns[0]?.receivedAt;
    const latest = reports[0]?.createdAt;
    return {
      todayEntries,
      todayStockInCount,
      stockInUpdated: stockInLatest ? new Date(stockInLatest).toLocaleString("en-IN") : "No updates yet",
      lastUpdated: latest ? new Date(latest).toLocaleString("en-IN") : "No updates yet",
    };
  }, [reportsQuery.data, stockInQuery.data]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Card className="p-6">
        <p className="text-sm uppercase tracking-wide opacity-60">Operations Console</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Good Evening, {user?.name ?? "Ops Manager"}</h1>
        <p className="mt-2 text-sm opacity-80">Role-aware workspace for operations and field sales execution.</p>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {opsView ? (
          <QuickActionCard
            title="Stock In"
            subtitle="Record incoming goods"
            buttonText="Open Stock In"
            onClick={() => navigate("/inventory/stock-in")}
            icon={<Inbox size={20} />}
          />
        ) : null}
        {opsView ? (
          <QuickActionCard
            title="Daily Operations"
            subtitle="Orders and returns entry"
            buttonText="Open Daily Ops"
            onClick={() => navigate("/inventory/daily-operations")}
            icon={<ClipboardList size={20} />}
          />
        ) : null}
        {fseView ? (
          <QuickActionCard
            title="Take Order"
            subtitle="Create new sales order"
            buttonText="Create Order"
            onClick={() => navigate("/sales/create-order")}
            icon={<ShoppingBag size={20} />}
          />
        ) : null}
        {fseView ? (
          <QuickActionCard
            title="My Orders"
            subtitle="Track unpaid and partial orders"
            buttonText="Open Orders"
            onClick={() => navigate("/sales/orders")}
            icon={<ClipboardList size={20} />}
          />
        ) : null}
        {fseView ? (
          <QuickActionCard
            title="Payments"
            subtitle="Collect and record payments"
            buttonText="Track Payments"
            onClick={() => navigate("/sales/payments")}
            icon={<CreditCard size={20} />}
          />
        ) : null}
        {fseView ? (
          <QuickActionCard
            title="My Commission"
            subtitle="Monthly commission details"
            buttonText="View Commission"
            onClick={() => navigate("/sales/commission")}
            icon={<Percent size={20} />}
          />
        ) : null}
      </div>

      {opsView ? (
      <Card className="space-y-4 border-2 border-nexo-accent bg-[#e9f6ed] p-6 dark:bg-[#22362b]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-nexo-accent/20 p-3 text-nexo-accent">
              <Inbox size={24} />
            </div>
            <div>
              <div className="mb-2 inline-flex rounded-full bg-nexo-accent px-2 py-1 text-xs font-semibold text-white">Primary Action</div>
              <h2 className="text-2xl font-black">Stock In</h2>
              <p className="mt-1 text-sm opacity-80">Record all incoming stock received at warehouse</p>
              <p className="mt-2 text-sm font-semibold text-nexo-accent">All stock entries must be logged here</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/70 px-3 py-2 text-right text-xs dark:bg-black/20">
            <p className="opacity-70">Today&apos;s stock in</p>
            <p className="text-xl font-bold">{summary.todayStockInCount}</p>
          </div>
        </div>

        {summary.todayStockInCount === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/50 dark:bg-amber-900/20 dark:text-amber-100">
            <AlertCircle size={16} /> No stock-in recorded today. Start here before daily operations.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs opacity-70">Last updated: {summary.stockInUpdated}</p>
          <Button className="h-12 w-full text-base sm:w-auto" onClick={() => navigate("/inventory/stock-in")}>
            Add Stock <MoveRight size={16} />
          </Button>
        </div>
      </Card>
      ) : null}

      {opsView ? (
      <Card className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-nexo-accent/15 p-3 text-nexo-accent">
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Daily Operations</h3>
            <p className="mt-1 text-sm opacity-80">Log orders and returns after stock in is recorded.</p>
          </div>
        </div>

        <Button variant="secondary" className="h-11 w-full text-base sm:w-auto" onClick={() => navigate("/inventory/daily-operations")}>
          Start Entry <MoveRight size={16} />
        </Button>
      </Card>
      ) : null}

      {opsView ? (
      <Card className="p-5">
        {reportsQuery.isLoading || stockInQuery.isLoading ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-black/5 p-3 dark:bg-white/10">
              <p className="text-xs uppercase tracking-wide opacity-60">Today&apos;s stock in</p>
              <p className="mt-2 text-2xl font-bold">{summary.todayStockInCount}</p>
            </div>
            <div className="rounded-xl bg-black/5 p-3 dark:bg-white/10">
              <p className="text-xs uppercase tracking-wide opacity-60">Today&apos;s entries</p>
              <p className="mt-2 text-2xl font-bold">{summary.todayEntries}</p>
            </div>
            <div className="rounded-xl bg-black/5 p-3 dark:bg-white/10">
              <p className="text-xs uppercase tracking-wide opacity-60">Last updated</p>
              <p className="mt-2 text-sm font-semibold">{summary.lastUpdated}</p>
            </div>
          </div>
        )}
      </Card>
      ) : null}
    </div>
  );
}

function QuickActionCard({
  title,
  subtitle,
  buttonText,
  onClick,
  icon,
}: {
  title: string;
  subtitle: string;
  buttonText: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 inline-flex rounded-lg bg-nexo-accent/10 p-2 text-nexo-accent">{icon}</div>
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm opacity-70">{subtitle}</p>
      <Button className="mt-4 h-11 w-full" onClick={onClick}>{buttonText}</Button>
    </Card>
  );
}
