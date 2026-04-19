import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { productService } from "@/services/productService";
import { stockInService } from "@/services/stockInService";

export function StockInPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["product-catalog"],
    queryFn: productService.getProducts,
  });
  const entriesQuery = useQuery({
    queryKey: ["stock-in-entries"],
    queryFn: stockInService.getEntries,
  });

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState("");

  const options = useMemo(
    () => products.map((product) => ({ value: product.id, label: `${product.name} (${product.sku})` })),
    [products],
  );

  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = (entriesQuery.data ?? []).filter((entry) => entry.receivedAt.slice(0, 10) === today);

  const addMutation = useMutation({
    mutationFn: () => stockInService.recordStockIn({ productId, qty, note }),
    onSuccess: () => {
      toast.success("Stock In recorded.");
      setQty(1);
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["stock-in-entries"] });
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

    if (!productId) {
      toast.error("Select a product for stock in.");
      return;
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }

    addMutation.mutate();
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
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs uppercase opacity-70">Product</p>
            <Dropdown
              value={productId}
              options={options}
              placeholder={productsLoading ? "Loading products..." : "Select product"}
              onChange={setProductId}
            />
          </div>

          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Quantity</p>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 0)}
            />
          </div>

          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Note (Optional)</p>
            <Input value={note} placeholder="Vendor / GRN / remarks" onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="h-11 w-full sm:w-auto" disabled={addMutation.isPending}>
              <Plus size={16} /> {addMutation.isPending ? "Saving..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-base font-semibold">Today&apos;s Stock In ({todaysEntries.length})</h3>
        {todaysEntries.length === 0 ? (
          <p className="mt-2 text-sm opacity-75">No stock in recorded today yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {todaysEntries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/20">
                <p className="font-semibold">{entry.productName}</p>
                <p className="opacity-75">Qty: {entry.qty}</p>
                <p className="text-xs opacity-60">{new Date(entry.receivedAt).toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
