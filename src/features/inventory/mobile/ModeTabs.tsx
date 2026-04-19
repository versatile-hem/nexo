import { cn } from "@/utils/cn";

interface ModeTabsProps {
  mode: "orders" | "returns";
  onChange: (mode: "orders" | "returns") => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="sticky top-[86px] z-20 rounded-xl bg-white/90 p-1 shadow-card backdrop-blur dark:bg-[#213124]/90">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          className={cn(
            "min-h-11 rounded-lg text-sm font-semibold",
            mode === "orders" ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
          )}
          onClick={() => onChange("orders")}
        >
          Orders
        </button>
        <button
          type="button"
          className={cn(
            "min-h-11 rounded-lg text-sm font-semibold",
            mode === "returns" ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
          )}
          onClick={() => onChange("returns")}
        >
          Returns
        </button>
      </div>
    </div>
  );
}
