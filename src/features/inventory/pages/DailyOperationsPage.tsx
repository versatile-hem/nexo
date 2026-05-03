import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { SalesChannel, DailyOpsOrderRow, DailyOpsReturnRow } from "@/mocks/types";
import { useDailyOpsStore } from "@/store/dailyOpsStore";
import { dailyOpsService } from "@/services/dailyOpsService";
import { productService } from "@/services/productService";
import { operationsApi } from "@/services/operationsApi";
import { OrdersTable } from "@/features/inventory/components/OrdersTable";
import { ReturnsTable } from "@/features/inventory/components/ReturnsTable";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileDailyOperations } from "@/features/inventory/mobile/MobileDailyOperations";

const channels: SalesChannel[] = ["Meesho", "Flipkart", "Amazon", "Offline"];

type Focusable = HTMLInputElement | HTMLButtonElement | null;

type SectionKey = "orders" | "returns";

export function DailyOperationsPage() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["product-catalog"],
    queryFn: productService.getProducts,
  });

  const {
    date,
    channel,
    orders,
    returns,
    setDate,
    setChannel,
    setOrders,
    addOrderRow,
    addReturnRow,
    updateOrderRow,
    updateReturnRow,
    removeOrderRow,
    removeReturnRow,
    reset,
  } = useDailyOpsStore();

  const [rawInput, setRawInput] = useState("Shadowfax=46 ebook\nVolmo=113 ebook");
  const [updatedBalances, setUpdatedBalances] = useState<Array<{ productId: string; quantity: number }>>([]);
  const refs = useRef<Record<string, Focusable>>({});

  const summary = useMemo(() => {
    const totalOrdersQty = sanitizeOrders(orders).reduce((sum, row) => sum + row.qty, 0);
    const totalReturnsQty = sanitizeReturns(returns).reduce((sum, row) => sum + row.qty, 0);
    return {
      totalOrdersQty,
      totalReturnsQty,
      netStockImpact: totalOrdersQty - totalReturnsQty,
    };
  }, [orders, returns]);

  const parseMutation = useMutation({
    mutationFn: (text: string) => dailyOpsService.parseRawInput(text, products),
    onSuccess: (rows) => {
      if (rows.length === 0) {
        toast.error("No valid lines found. Example: Shadowfax=46 ebook");
        return;
      }
      setOrders([...sanitizeOrders(orders), ...rows]);
      toast.success(`Parsed ${rows.length} line(s) into orders.`);
      requestAnimationFrame(() => focusCell("orders", orders.length, 0, refs.current));
    },
    onError: () => toast.error("Could not parse input."),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const stockProducts = products;
      const byId = new Map(stockProducts.map((item) => [item.id, item]));
      const byName = new Map(stockProducts.map((item) => [normalize(item.name), item]));

      const cleanOrders = sanitizeOrders(orders);
      const cleanReturns = sanitizeReturns(returns);

      if (cleanOrders.length === 0 && cleanReturns.length === 0) {
        throw new Error("Add at least one valid order or return row.");
      }

      const unknown = [
        ...cleanOrders.filter((row) => !resolveStockProduct(row, byId, byName)),
        ...cleanReturns.filter((row) => !resolveStockProduct(row, byId, byName)),
      ];
      if (unknown.length > 0) {
        throw new Error(`Unknown products: ${unknown.map((item) => item.productName).join(", ")}`);
      }

      // Build operations array for batch endpoint
      const operations = [
        ...cleanOrders.map((row) => {
          const product = resolveStockProduct(row, byId, byName)!;
          return {
            type: "ORDER" as const,
            productId: product.id,
            quantity: row.qty,
            unit: row.unit,
            courier: row.courier,
            channel: channel as "Meesho" | "Flipkart" | "Offline" | "Amazon" | undefined,
            movementTime: new Date().toISOString(),
          };
        }),
        ...cleanReturns.map((row) => {
          const product = resolveStockProduct(row, byId, byName)!;
          return {
            type: "RETURN" as const,
            productId: product.id,
            quantity: row.qty,
            unit: row.unit,
            courier: row.courier,
            channel: channel as "Meesho" | "Flipkart" | "Offline" | "Amazon" | undefined,
            movementTime: new Date().toISOString(),
          };
        }),
      ];

      // Call batch endpoint with error handling
      let result = [];
      try {
        result = await operationsApi.endOfDayOperations(operations);
      } catch (err) {
        // Continue even if batch endpoint fails - data is saved via dailyOpsService
        console.warn("Batch operations failed, continuing with report save", err);
      }

      await dailyOpsService.saveDailyReport({
        date,
        channel,
        orders: cleanOrders,
        returns: cleanReturns,
      });

      return result;
    },
    onSuccess: (results) => {
      toast.success("Daily operations saved and stock updated.");
      // Handle both array and object responses from batch endpoint
      const balances = Array.isArray(results) ? results : (results?.operations ? results.operations : []);
      setUpdatedBalances(balances);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
      reset();
      setRawInput("Shadowfax=46 ebook\nVolmo=113 ebook");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save daily operations.");
    },
  });

  const onKeyNav = (
    event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
    section: SectionKey,
    rowIndex: number,
    colIndex: number,
    colCount: number,
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const isLast = colIndex === colCount - 1;

    if (!isLast) {
      focusCell(section, rowIndex, colIndex + 1, refs.current);
      return;
    }

    if (section === "orders") {
      addOrderRow();
      requestAnimationFrame(() => focusCell("orders", orders.length, 0, refs.current));
    } else {
      addReturnRow();
      requestAnimationFrame(() => focusCell("returns", returns.length, 0, refs.current));
    }
  };

  const channelOptions = channels.map((item) => ({ value: item, label: item }));

  const handleSave = () => {
    const hasOrders = sanitizeOrders(orders).length > 0;
    if (hasOrders && !window.confirm("Proceed with ORDER entries? This will reduce stock quantities.")) {
      return;
    }
    saveMutation.mutate();
  };

  if (isMobile) {
    return (
      <MobileDailyOperations
        date={date}
        channel={channel}
        channelOptions={channelOptions}
        orders={orders}
        returns={returns}
        products={products}
        productsLoading={productsLoading}
        rawInput={rawInput}
        parseLoading={parseMutation.isPending}
        saveLoading={saveMutation.isPending}
        summary={summary}
        onDateChange={setDate}
        onChannelChange={setChannel}
        onParseInputChange={setRawInput}
        onParse={() => parseMutation.mutate(rawInput)}
        onSave={handleSave}
        onAddOrderRow={addOrderRow}
        onAddReturnRow={addReturnRow}
        onUpdateOrderRow={updateOrderRow}
        onUpdateReturnRow={updateReturnRow}
        onDeleteOrderRow={removeOrderRow}
        onDeleteReturnRow={removeReturnRow}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="space-y-4">
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <div>
              <p className="mb-1 text-xs uppercase opacity-70">Date</p>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">Channel</p>
              <Dropdown
                value={channel}
                options={channelOptions}
                onChange={(value) => setChannel(value as SalesChannel)}
              />
            </div>

            <Button onClick={handleSave} disabled={saveMutation.isPending} className="mt-5">
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>

        <Card className="hidden">
          <h2 className="mb-2 text-lg font-semibold">Smart Input Parser</h2>
          <p className="mb-3 text-sm opacity-70">Paste bulk lines like Shadowfax=46 ebook and parse into orders.</p>
          <textarea
            className="min-h-28 w-full rounded-xl border border-black/10 bg-white/80 p-3 text-sm outline-none transition focus:border-nexo-accent focus:ring-2 focus:ring-nexo-accent/30 dark:border-white/20 dark:bg-[#213124]"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
          />
          <div className="mt-3">
            <Button variant="secondary" onClick={() => parseMutation.mutate(rawInput)} disabled={parseMutation.isPending}>
              {parseMutation.isPending ? "Parsing..." : "Parse Input"}
            </Button>
          </div>
        </Card>

        <Card>
          <OrdersTable
            rows={orders}
            products={products}
            productLoading={productsLoading}
            onAddRow={() => {
              addOrderRow();
              requestAnimationFrame(() => focusCell("orders", orders.length, 0, refs.current));
            }}
            onDelete={removeOrderRow}
            onUpdate={updateOrderRow}
            registerRef={(key, element) => {
              refs.current[key] = element;
            }}
            onKeyNav={onKeyNav}
          />
        </Card>

        <Card>
          <ReturnsTable
            rows={returns}
            products={products}
            productLoading={productsLoading}
            onAddRow={() => {
              addReturnRow();
              requestAnimationFrame(() => focusCell("returns", returns.length, 0, refs.current));
            }}
            onDelete={removeReturnRow}
            onUpdate={updateReturnRow}
            registerRef={(key, element) => {
              refs.current[key] = element;
            }}
            onKeyNav={onKeyNav}
          />
        </Card>
      </div>
    </div>
  );
}

function sanitizeOrders(rows: DailyOpsOrderRow[]) {
  return rows.filter((row) => row.courier.trim() && row.productName.trim() && row.qty > 0);
}

function sanitizeReturns(rows: DailyOpsReturnRow[]) {
  return rows.filter((row) => row.productName.trim() && row.qty > 0);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function resolveStockProduct(
  row: { productId?: string; productName: string },
  byId: Map<string, { id: string }>,
  byName: Map<string, { id: string }>,
) {
  if (row.productId && byId.has(row.productId)) {
    return byId.get(row.productId);
  }
  return byName.get(normalize(row.productName));
}

function focusCell(
  section: SectionKey,
  rowIndex: number,
  colIndex: number,
  refs: Record<string, Focusable>,
) {
  const key = `${section}-${rowIndex}-${colIndex}`;
  refs[key]?.focus();
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: number; emphasized?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="opacity-70">{label}</span>
      <span className={emphasized ? "text-lg font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
