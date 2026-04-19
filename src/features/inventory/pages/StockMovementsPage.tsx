import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/States";
import { inventoryService } from "@/services/inventoryService";

export function StockMovementsPage() {
  const movementQuery = useQuery({ queryKey: ["stock-movements"], queryFn: inventoryService.getStockMovements });
  const movements = movementQuery.data ?? [];

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Stock Movements</h2>
      {movements.length === 0 ? (
        <EmptyState title="No movements yet" subtitle="Stock changes will appear here." />
      ) : (
        <ul className="space-y-2">
          {movements.map((movement) => (
            <li key={movement.id} className="flex items-center justify-between rounded-lg border border-black/10 p-3">
              <div>
                <p className="font-medium">{movement.product}</p>
                <p className="text-xs opacity-70">{movement.date}</p>
              </div>
              <span className={movement.type === "IN" ? "text-green-700" : "text-red-700"}>
                {movement.type} {movement.qty}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
