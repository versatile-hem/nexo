import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, Inbox, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dailyOpsService } from "@/services/dailyOpsService";
import { stockInService } from "@/services/stockInService";
import { useAuthStore } from "@/store/authStore";

export function OperationDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
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
        <p className="mt-2 text-sm opacity-80">First log incoming goods in Stock In, then proceed with Daily Operations.</p>
      </Card>

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
    </div>
  );
}
