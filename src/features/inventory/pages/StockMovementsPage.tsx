import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/Dropdown";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { StockMovement, SalesChannel } from "@/mocks/types";
import { inventoryService } from "@/services/inventoryService";
import { productService } from "@/services/productService";

// Map backend channel format to SalesChannel
function mapToSalesChannel(channel: string | undefined): SalesChannel | "Manual" {
  if (!channel || channel.trim() === "") return "Manual";
  
  let normalizedChannel = channel.trim();
  
  // Handle "courier=" format by extracting the value after "="
  if (normalizedChannel.includes("=")) {
    const parts = normalizedChannel.split("=");
    normalizedChannel = parts[parts.length - 1].trim();
  }
  
  if (!normalizedChannel) return "Manual";
  
  normalizedChannel = normalizedChannel.toUpperCase();
  
  const channelMap: Record<string, SalesChannel> = {
    "MEESHO": "Meesho",
    "FLIPKART": "Flipkart",
    "AMAZON": "Amazon",
    "OFFLINE": "Offline",
    "WAREHOUSE": "Offline",
    // Courier names to channels
    "SHADOWFAX": "Meesho",
    "DELHIVERY": "Meesho",
    "XPRESSBEES": "Meesho",
    "EKART": "Amazon",
  };
  
  return channelMap[normalizedChannel] || normalizedChannel as SalesChannel;
}

export function StockMovementsPage() {
  const [type, setType] = useState<"IN" | "OUT" | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data: products = [] } = useQuery({
    queryKey: ["product-catalog"],
    queryFn: productService.getProducts,
  });

  const movementQuery = useQuery({
    queryKey: ["stock-movements", type, startDate, endDate, page, pageSize],
    queryFn: () =>
      inventoryService.getStockMovementsFiltered(
        type as "IN" | "OUT" | undefined,
        startDate,
        endDate,
        page,
        pageSize,
      ),
    refetchInterval: 10000,
  });

  const movements = movementQuery.data?.content ?? [];
  const totalPages = movementQuery.data?.totalPages ?? 1;
  const totalElements = movementQuery.data?.totalElements ?? 0;

  // Filter movements by selected product (client-side)
  const filteredMovements = useMemo(() => {
    if (!productId) return movements;
    return movements.filter((m: StockMovement) => {
      if (m.items && m.items.length > 0) {
        return m.items.some((item) => item.productId === Number(productId) || item.productId === productId);
      }
      return m.productId === productId;
    });
  }, [movements, productId]);

  // Calculate pagination for filtered results
  const isFiltered = productId ? true : false;
  const displayedTotalElements = isFiltered ? filteredMovements.length : totalElements;
  const displayedTotalPages = isFiltered ? Math.ceil(displayedTotalElements / pageSize) || 1 : totalPages;
  const displayedPage = isFiltered && page >= displayedTotalPages ? displayedTotalPages - 1 : page;

  // Get current page items for display
  const paginatedMovements = useMemo(() => {
    if (isFiltered) {
      // Client-side pagination for filtered results
      const start = displayedPage * pageSize;
      const end = start + pageSize;
      return filteredMovements.slice(start, end);
    }
    // Server-side pagination: movements are already paginated from API
    return movements;
  }, [filteredMovements, displayedPage, pageSize, isFiltered, movements]);

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "IN", label: "Stock In" },
    { value: "OUT", label: "Stock Out" },
  ];

  const productOptions = [
    { value: "", label: "All Products" },
    ...products.map((p) => ({
      value: String(p.id),
      label: p.name,
    })),
  ];

  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "20", label: "20 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  const resetFilters = () => {
    setType("");
    setStartDate("");
    setEndDate("");
    setProductId("");
    setPage(0);
    setPageSize(20);
  };

  if (movementQuery.isLoading) {
    return (
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Stock Movements</h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (movementQuery.isError) {
    return (
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Stock Movements</h2>
        <ErrorState
          message="Failed to load stock movement history"
          onRetry={() => movementQuery.refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Stock Movements</h2>

        <div className="space-y-3 border-b border-black/10 pb-4 dark:border-white/10">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <p className="mb-1 text-xs uppercase opacity-70">Type</p>
              <Dropdown
                value={type}
                options={typeOptions}
                onChange={(value) => {
                  setType(value as "IN" | "OUT" | "");
                  setPage(0);
                }}
              />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">From</p>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">To</p>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">Product</p>
              <Dropdown
                value={productId}
                options={productOptions}
                placeholder="Select product..."
                searchable
                onChange={(value) => {
                  setProductId(value);
                  setPage(0);
                }}
              />
            </div>

            <div>
              <p className="mb-1 text-xs uppercase opacity-70">Per Page</p>
              <Dropdown
                value={String(pageSize)}
                options={pageSizeOptions}
                onChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              />
            </div>

            <div className="flex items-end">
              <Button variant="secondary" onClick={resetFilters} className="w-full">
                <Filter size={14} /> Reset
              </Button>
            </div>
          </div>

          {(type || startDate || endDate || productId) && (
            <p className="text-xs text-nexo-accent">
              Showing {paginatedMovements.length} of {displayedTotalElements} movements
              {type && ` • Type: ${type}`}
              {startDate && ` • From: ${startDate}`}
              {endDate && ` • To: ${endDate}`}
              {productId && ` • Product: ${products.find((p) => String(p.id) === productId)?.name}`}
            </p>
          )}
        </div>

        <div className="mt-4">
          {paginatedMovements.length === 0 ? (
            <EmptyState
              title="No movements found"
              subtitle={
                productId || type || startDate || endDate
                  ? "Try adjusting your filters"
                  : "Stock changes will appear here"
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="px-3 py-2 text-left font-semibold">Product</th>
                    <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                    <th className="px-3 py-2 text-center font-semibold">Channel</th>
                    <th className="px-3 py-2 text-center font-semibold">Type</th>
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovements.map((movement: StockMovement) => {
                    const items = movement.items || [];
                    const hasItems = items.length > 0;
                    const movementDate = movement.createdAt
                      ? new Date(movement.createdAt).toLocaleDateString()
                      : movement.date;
                    const type = movement.type;

                    if (hasItems) {
                      return items.map((item, idx) => {
                        const itemChannel = item.channel || item.salesChannel || movement.channel || movement.salesChannel || "Manual";
                        return (
                          <tr
                            key={`${movement.id}-${idx}`}
                            className="border-b border-black/5 hover:bg-black/2 dark:border-white/5 dark:hover:bg-white/2"
                          >
                            <td className="px-3 py-3">
                              <p className="font-medium">{item.productName}</p>
                              {item.sku && <p className="text-xs opacity-60">{item.sku}</p>}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold">{item.quantity}</td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {itemChannel}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                  type === "IN"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {type}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs opacity-70">{movementDate}</td>
                          </tr>
                        );
                      });
                    }
                    const qty = movement.qty || 0;
                    const channel = movement.channel || movement.salesChannel || "Manual";
                    return (
                      <tr
                        key={movement.id}
                        className="border-b border-black/5 hover:bg-black/2 dark:border-white/5 dark:hover:bg-white/2"
                      >
                        <td className="px-3 py-3 font-medium">{movement.product}</td>
                        <td className="px-3 py-3 text-right font-semibold">{qty}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {channel}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                              type === "IN"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs opacity-70">{movementDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {movements.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-black/10 pt-4 dark:border-white/10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs opacity-70">
                Showing {Math.max(1, displayedPage * pageSize + 1)} to {Math.min((displayedPage + 1) * pageSize, displayedTotalElements)} of{" "}
                <span className="font-semibold">{displayedTotalElements}</span> movements
                {pageSize && ` • ${pageSize} per page`}
              </p>
              {displayedTotalPages > 1 && (
                <p className="text-xs opacity-70">
                  Page <span className="font-semibold">{displayedPage + 1}</span> of{" "}
                  <span className="font-semibold">{displayedTotalPages}</span>
                </p>
              )}
            </div>

            {displayedTotalPages > 1 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={displayedPage === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(displayedTotalPages - 1, p + 1))}
                  disabled={displayedPage >= displayedTotalPages - 1}
                  className="flex items-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight size={16} strokeWidth={2.5} />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

