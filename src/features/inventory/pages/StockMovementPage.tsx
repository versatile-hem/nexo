import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, Trash2, AlertCircle, CheckCircle2, Loader } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { EmptyState } from "@/components/shared/States";
import { StockMovementType } from "@/mocks/types";
import { productService } from "@/services/productService";
import { inventoryService } from "@/services/inventoryService";
import { operationsApi } from "@/services/operationsApi";
import { validatePositiveQuantity } from "@/utils/validation";

interface StockMovementRow {
  productId: string;
  quantity: number;
}

// Helper function to format date for datetime input
function getLocalDateTimeString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function StockMovementPage() {
  const queryClient = useQueryClient();
  const [movementType, setMovementType] = useState<StockMovementType>("IN");
  const [rows, setRows] = useState<StockMovementRow[]>([{ productId: "", quantity: 1 }]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [movementTime, setMovementTime] = useState<string>(getLocalDateTimeString(new Date()));

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["product-catalog"],
    queryFn: productService.getProducts,
  });

  // Fetch individual product details for live stock display
  const { data: selectedProduct } = useQuery({
    queryKey: ["product-detail", selectedProductId],
    queryFn: () => (selectedProductId ? productService.getProductById(selectedProductId) : null),
    enabled: !!selectedProductId,
  });

  // Fetch movement history
  const { data: movements = [] } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: inventoryService.getStockMovements,
  });

  // Product dropdown options
  const productOptions = useMemo(
    () => products.map((product) => ({ value: product.id, label: `${product.name} (${product.sku})` })),
    [products],
  );

  // Stock In mutation
  const stockInMutation = useMutation({
    mutationFn: () => {
      const isoTime = new Date(movementTime).toISOString();
      return operationsApi.stockIn(
        rows.map((row) => ({
          productId: row.productId,
          quantity: row.quantity,
          unit: "nos",
          movementTime: isoTime,
        })),
      );
    },
    onSuccess: () => {
      toast.success("Stock In recorded successfully.");
      setRows([{ productId: "", quantity: 1 }]);
      setSelectedProductId("");
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-catalog"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to record stock in.");
    },
  });

  // Stock Out mutation
  const stockOutMutation = useMutation({
    mutationFn: () => {
      const isoTime = new Date(movementTime).toISOString();
      return Promise.all(
        rows.map((row) =>
          operationsApi.dailyOperation({
            type: "ORDER",
            productId: row.productId,
            quantity: row.quantity,
            unit: "nos",
            channel: "Offline",
            movementTime: isoTime,
          }),
        ),
      );
    },
    onSuccess: () => {
      toast.success("Stock Out recorded successfully.");
      setRows([{ productId: "", quantity: 1 }]);
      setSelectedProductId("");
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-catalog"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to record stock out.");
    },
  });

  // Form submission
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Validation
    if (rows.some((row) => !row.productId)) {
      toast.error("Select a product for each row.");
      return;
    }

    const invalidQty = rows.find((row) => !validatePositiveQuantity(row.quantity).valid);
    if (invalidQty) {
      toast.error("All quantities must be greater than 0.");
      return;
    }

    if (movementType === "IN") {
      stockInMutation.mutate();
    } else {
      stockOutMutation.mutate();
    }
  };

  // Update row
  const updateRow = (index: number, patch: Partial<StockMovementRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

    // Update selected product for live display
    if (patch.productId) {
      setSelectedProductId(patch.productId);
    }
  };

  // Add row
  const addRow = () => {
    setRows((prev) => [...prev, { productId: "", quantity: 1 }]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Get available stock for selected product
  const availableStock = selectedProduct ? selectedProduct.stock : 0;

  // Filter movements for display (show recent ones first)
  const recentMovements = movements.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-2 border-nexo-accent/30 bg-nexo-accent/5 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-nexo-accent/20 p-3 text-nexo-accent">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Stock Movement</h1>
            <p className="mt-1 text-sm opacity-80">Record incoming or outgoing stock transactions.</p>
            <p className="mt-2 inline-flex rounded-full bg-nexo-accent/15 px-2 py-1 text-xs font-semibold text-nexo-accent">
              {movementType === "IN" ? "Stock In" : "Stock Out"}
            </p>
          </div>
        </div>
      </Card>

      {/* Form Card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Record Movement</h2>
          {/* Toggle Stock Type */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={movementType === "IN" ? "primary" : "secondary"}
              onClick={() => setMovementType("IN")}
              className="w-24"
            >
              Stock In
            </Button>
            <Button
              type="button"
              variant={movementType === "OUT" ? "primary" : "secondary"}
              onClick={() => setMovementType("OUT")}
              className="w-24"
            >
              Stock Out
            </Button>
          </div>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          {/* Movement Time */}
          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Movement Time</p>
            <Input
              type="datetime-local"
              value={movementTime}
              onChange={(e) => setMovementTime(e.target.value)}
            />
          </div>

          {/* Live Stock Display */}
          {selectedProductId && selectedProduct && (
            <div className="rounded-lg border-l-4 border-nexo-accent bg-nexo-accent/5 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-nexo-accent" />
                <span className="text-sm font-medium">
                  Available: <span className="font-bold">{availableStock} units</span>
                </span>
              </div>
            </div>
          )}

          {/* Rows */}
          {rows.map((row, index) => (
            <div
              key={`movement-row-${index}`}
              className="grid gap-2 rounded-xl border border-black/10 p-3 sm:grid-cols-5 dark:border-white/20"
            >
              {/* Product Dropdown */}
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs uppercase opacity-70">Product</p>
                <Dropdown
                  value={row.productId}
                  options={productOptions}
                  placeholder={productsLoading ? "Loading..." : "Select product"}
                  onChange={(value) => updateRow(index, { productId: value })}
                />
              </div>

              {/* Quantity */}
              <div>
                <p className="mb-1 text-xs uppercase opacity-70">Quantity</p>
                <Input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => updateRow(index, { quantity: Number(e.target.value) || 0 })}
                  autoFocus={index === rows.length - 1}
                />
              </div>

              {/* Validation Warning */}
              {!validatePositiveQuantity(row.quantity).valid && (
                <div className="flex items-center justify-center">
                  <div className="rounded-lg bg-red-50 p-2 text-red-600" title="Invalid quantity">
                    <AlertCircle size={16} />
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={rows.length === 1}
                  onClick={() => removeRow(index)}
                  title="Remove row"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Row & Submit */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={addRow}>
              <Plus size={16} /> Add Row
            </Button>
            <Button type="submit" disabled={stockInMutation.isPending || stockOutMutation.isPending} className="h-11">
              {stockInMutation.isPending || stockOutMutation.isPending ? (
                <>
                  <Loader size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                `Record ${movementType}`
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Movement History Card */}
      <Card>
        <h3 className="mb-3 text-base font-semibold">Recent Movements</h3>
        {recentMovements.length === 0 ? (
          <EmptyState title="No movements yet" subtitle="Movements will appear here." />
        ) : (
          <div className="space-y-2">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between rounded-lg border border-black/10 p-3">
                <div className="flex-1">
                  <p className="font-medium">{movement.product}</p>
                  <p className="text-xs opacity-70">{movement.date}</p>
                </div>
                <span
                  className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${
                    movement.type === "IN"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {movement.type} {movement.qty}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
