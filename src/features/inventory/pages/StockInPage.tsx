import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { productService } from "@/services/productService";
import { operationsApi, StockInLineItem } from "@/services/operationsApi";
import { validatePositiveQuantity } from "@/utils/validation";

export function StockInPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["product-catalog"],
    queryFn: productService.getProducts,
  });
  const [items, setItems] = useState<StockInLineItem[]>([
    { productId: "", quantity: 1, unit: "nos", supplier: "", batchNumber: "" },
  ]);
  const [resultRows, setResultRows] = useState<Array<{ productId: string; quantity: number }>>([]);

  const options = useMemo(
    () => products.map((product) => ({ value: product.id, label: `${product.name} (${product.sku})` })),
    [products],
  );

  const addMutation = useMutation({
    mutationFn: () => operationsApi.stockIn(items),
    onSuccess: (balances) => {
      toast.success("Stock In recorded.");
      setResultRows(balances);
      setItems([{ productId: "", quantity: 1, unit: "nos", supplier: "", batchNumber: "" }]);
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["operation-dashboard-stockin"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not record stock in.");
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (items.some((item) => !item.productId)) {
      toast.error("Select product for each line item.");
      return;
    }

    const invalidQty = items.find((item) => !validatePositiveQuantity(item.quantity).valid);
    if (invalidQty) {
      toast.error("Each line item must have quantity greater than 0.");
      return;
    }

    addMutation.mutate();
  };

  const updateItem = (index: number, patch: Partial<StockInLineItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-nexo-accent/30 bg-nexo-accent/5 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-nexo-accent/20 p-3 text-nexo-accent">
            <Inbox size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Stock In</h1>
            <p className="mt-1 text-sm opacity-80">Record all incoming stock received at warehouse.</p>
            <p className="mt-2 inline-flex rounded-full bg-nexo-accent/15 px-2 py-1 text-xs font-semibold text-nexo-accent">
              All stock entries must be logged here
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Add Incoming Goods</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          {items.map((item, index) => (
            <div key={`stock-in-row-${index}`} className="grid gap-2 rounded-xl border border-black/10 p-3 sm:grid-cols-5 dark:border-white/20">
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs uppercase opacity-70">Product</p>
                <Dropdown
                  value={item.productId}
                  options={options}
                  placeholder={productsLoading ? "Loading products..." : "Select product"}
                  onChange={(value) => updateItem(index, { productId: value })}
                />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase opacity-70">Qty</p>
                <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase opacity-70">Unit</p>
                <Input value={item.unit} onChange={(e) => updateItem(index, { unit: e.target.value || "nos" })} />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={items.length === 1}
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase opacity-70">Supplier</p>
                <Input value={item.supplier || ""} onChange={(e) => updateItem(index, { supplier: e.target.value })} />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase opacity-70">Batch Number</p>
                <Input value={item.batchNumber || ""} onChange={(e) => updateItem(index, { batchNumber: e.target.value })} />
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setItems((prev) => [...prev, { productId: "", quantity: 1, unit: "nos", supplier: "", batchNumber: "" }])}
            >
              <Plus size={16} /> Add Line
            </Button>
            <Button type="submit" className="h-11" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-base font-semibold">Updated Inventory Result</h3>
        {resultRows.length === 0 ? (
          <p className="mt-2 text-sm opacity-75">Submit stock-in to see updated quantity per product.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase opacity-70">
                <th className="p-2">Product ID</th>
                <th className="p-2">Updated Quantity</th>
              </tr>
            </thead>
            <tbody>
              {resultRows.map((row) => (
                <tr key={`${row.productId}-${row.quantity}`} className="border-b border-black/5">
                  <td className="p-2">{row.productId}</td>
                  <td className="p-2 font-semibold">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
