import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface InsightTileProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "default" | "warning" | "success";
  onClick?: () => void;
}

export function InsightTile({ title, subtitle, children, tone = "default", onClick }: InsightTileProps) {
  const interactive = Boolean(onClick);

  return (
    <div onClick={onClick} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined}>
      <Card
        className={cn(
          "transition duration-200",
          interactive ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg" : "",
          tone === "warning" ? "border-red-200 bg-red-50/70 dark:border-red-900/40 dark:bg-red-900/15" : "",
          tone === "success" ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-900/15" : "",
        )}
      >
        <div className="space-y-2">
          <p className="text-sm font-semibold">{title}</p>
          {subtitle ? <p className="text-xs opacity-70">{subtitle}</p> : null}
          {children}
        </div>
      </Card>
    </div>
  );
}
