interface BottomSummaryBarProps {
  totalOrdersQty: number;
  totalReturnsQty: number;
  netStockImpact: number;
}

export function BottomSummaryBar({ totalOrdersQty, totalReturnsQty, netStockImpact }: BottomSummaryBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white/95 px-3 py-2 backdrop-blur dark:border-white/20 dark:bg-[#1d2a1f]/95">
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="opacity-70">Orders</p>
          <p className="font-semibold">{totalOrdersQty}</p>
        </div>
        <div>
          <p className="opacity-70">Returns</p>
          <p className="font-semibold">{totalReturnsQty}</p>
        </div>
        <div>
          <p className="opacity-70">Net Impact</p>
          <p className="font-semibold">{netStockImpact}</p>
        </div>
      </div>
    </div>
  );
}
