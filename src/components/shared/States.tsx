import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-dashed border-black/20 p-8 text-center dark:border-white/20">
      <Inbox className="mx-auto mb-3" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm opacity-70">{subtitle}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-200">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry ? (
        <Button className="mt-3" variant="danger" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
