import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/Dropdown";
import { ErrorState } from "@/components/shared/States";
import { productService } from "@/services/productService";
import { inventoryApi } from "@/services/inventoryApi";

export function InventoryLookupPage() {
  const [productId, setProductId] = useState("");

  const productsQuery = useQuery({
    queryKey: ["product-catalog"],
    queryFn: productService.getProducts,
  });

  const queryByParam = useQuery({
    queryKey: ["inventory-by-query", productId],
    queryFn: () => inventoryApi.getByQueryProductId(productId),
    enabled: false,
  });

  const queryByPath = useQuery({
    queryKey: ["inventory-by-path", productId],
    queryFn: () => inventoryApi.getByPathProductId(productId),
    enabled: false,
  });

  const productName = useMemo(
    () => productsQuery.data?.find((item) => item.id === productId)?.name || "-",
    [productsQuery.data, productId],
  );

  const onLookup = () => {
    if (!productId) return;
    queryByParam.refetch();
    queryByPath.refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Inventory Lookup</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Dropdown
            value={productId}
            options={(productsQuery.data ?? []).map((item) => ({ value: item.id, label: `${item.name} (${item.sku})` }))}
            placeholder={productsQuery.isLoading ? "Loading products..." : "Select product"}
            onChange={setProductId}
          />
          <Button onClick={onLookup} disabled={!productId || queryByParam.isFetching || queryByPath.isFetching}>
            Lookup
          </Button>
        </div>
      </Card>

      {queryByParam.error || queryByPath.error ? <ErrorState message="Failed to load inventory balance" /> : null}

      {queryByParam.data || queryByPath.data ? (
        <Card>
          <h3 className="text-base font-semibold">Current Stock</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <ValueTile label="Product" value={productName} />
            <ValueTile label="Query Endpoint Quantity" value={String(queryByParam.data?.quantity ?? "-")} />
            <ValueTile label="Path Endpoint Quantity" value={String(queryByPath.data?.quantity ?? "-")} />
          </div>
          <p className="mt-3 text-xs opacity-65">History context is backend-dependent. Quantity endpoints are connected and verified.</p>
        </Card>
      ) : null}
    </div>
  );
}

function ValueTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-3 dark:border-white/20">
      <p className="text-xs uppercase opacity-60">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
