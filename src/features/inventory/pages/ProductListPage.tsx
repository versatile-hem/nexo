import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { inventoryService } from "@/services/inventoryService";
import { exportToCsv, formatCurrency } from "@/utils/format";
import { Product } from "@/mocks/types";

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 5;

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const sortBy = (searchParams.get("sort") as SortKey) ?? "name";
  const dir = (searchParams.get("dir") as SortDir) ?? "asc";

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: inventoryService.getProducts, refetchInterval: 9000 });

  const stockMutation = useMutation({
    mutationFn: ({ productId, type, qty }: { productId: string; type: "IN" | "OUT"; qty: number }) =>
      inventoryService.updateStock(productId, type, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Stock updated");
    },
  });

  const rows = useMemo(() => {
    const all = productsQuery.data ?? [];
    const filtered = all
      .filter((product) =>
        `${product.name}${product.sku}${product.category}`.toLowerCase().includes(filter.toLowerCase()),
      );

    return filtered.sort((a, b) => compareBy(a, b, sortBy, dir));
  }, [productsQuery.data, filter, sortBy, dir]);

  const maxPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), maxPage);
  const pagedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (productsQuery.error) {
    return <ErrorState message="Could not fetch products" onRetry={() => productsQuery.refetch()} />;
  }

  const onFilterChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("q", value);
      } else {
        next.delete("q");
      }
      next.set("page", "1");
      return next;
    });
  };

  const toggleSort = (nextSort: SortKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const currentSort = (next.get("sort") as SortKey) ?? "name";
      const currentDir = (next.get("dir") as SortDir) ?? "asc";
      const nextDir = currentSort === nextSort && currentDir === "asc" ? "desc" : "asc";
      next.set("sort", nextSort);
      next.set("dir", nextDir);
      next.set("page", "1");
      return next;
    });
  };

  const setPage = (nextPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(nextPage));
      return next;
    });
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Product List</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => exportToCsv("products.csv", rows)}>Export CSV</Button>
          <Link to="/products/new"><Button>Add Product</Button></Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Input placeholder="Filter by name, SKU, category" value={filter} onChange={(e) => onFilterChange(e.target.value)} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No products" subtitle="Create your first product to start inventory tracking." />
      ) : (
        <div className="space-y-3 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase opacity-70">
                <th className="p-2">
                  <button className="font-semibold" onClick={() => toggleSort("name")}>Name {sortBy === "name" ? sortArrow(dir) : ""}</button>
                </th>
                <th className="p-2">SKU</th>
                <th className="p-2">
                  <button className="font-semibold" onClick={() => toggleSort("price")}>Price {sortBy === "price" ? sortArrow(dir) : ""}</button>
                </th>
                <th className="p-2">
                  <button className="font-semibold" onClick={() => toggleSort("stock")}>Stock {sortBy === "stock" ? sortArrow(dir) : ""}</button>
                </th>
                <th className="p-2">Category</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((product) => (
                <tr key={product.id} className="border-b border-black/5">
                  <td className="p-2 font-medium">{product.name}</td>
                  <td className="p-2">{product.sku}</td>
                  <td className="p-2">{formatCurrency(product.price)}</td>
                  <td className="p-2">
                    <span className={product.stock < 10 ? "rounded-full bg-red-100 px-2 py-1 text-red-700" : ""}>{product.stock}</span>
                  </td>
                  <td className="p-2">{product.category}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => stockMutation.mutate({ productId: product.id, type: "IN", qty: 1 })}>+1</Button>
                      <Button variant="ghost" onClick={() => stockMutation.mutate({ productId: product.id, type: "OUT", qty: 1 })}>-1</Button>
                      <Button variant="ghost" onClick={() => setSelectedId(product.id)}>Details</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between text-xs">
            <p>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</Button>
              <Button variant="secondary" disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>Next</Button>
            </div>
          </div>

          {selectedId ? <RowDetails product={rows.find((row) => row.id === selectedId)} /> : null}
        </div>
      )}
    </Card>
  );
}

function compareBy(a: Product, b: Product, key: SortKey, dir: SortDir) {
  const direction = dir === "asc" ? 1 : -1;
  if (key === "name") return a.name.localeCompare(b.name) * direction;
  if (key === "price") return (a.price - b.price) * direction;
  return (a.stock - b.stock) * direction;
}

function sortArrow(dir: SortDir) {
  return dir === "asc" ? "▲" : "▼";
}

function RowDetails({ product }: { product?: Product }) {
  if (!product) return null;
  return (
    <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm dark:border-white/20 dark:bg-white/5">
      <p className="font-semibold">{product.name}</p>
      <p className="opacity-70">SKU: {product.sku}</p>
      <p className="opacity-70">Batch: {product.batchCode ?? "Not assigned"}</p>
      <div className="mt-2 flex gap-3">
        <Link className="text-nexo-accent underline" to="/inventory/stock-movements">View Stock Movements</Link>
        <Link className="text-nexo-accent underline" to="/inventory/batch">Open Batch Tracking</Link>
      </div>
    </div>
  );
}
