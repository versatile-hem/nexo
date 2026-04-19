import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { inventoryService } from "@/services/inventoryService";

export function BatchTrackingPage() {
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: inventoryService.getProducts });

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Lot / Batch Tracking</h2>
      <div className="space-y-2">
        {(productsQuery.data ?? []).map((product) => (
          <div key={product.id} className="rounded-lg border border-black/10 p-3 text-sm">
            <p className="font-medium">{product.name}</p>
            <p className="opacity-70">Batch: {product.batchCode ?? "Not assigned"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
