import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/States";
import { productsApi } from "@/services/productsApi";
import { useAuthStore } from "@/store/authStore";
import { isAdmin } from "@/utils/roleUtils";
import { formatCurrency } from "@/utils/format";

export function ProductDetailsPage() {
  const { productId = "" } = useParams<{ productId: string }>();
  const role = useAuthStore((state) => state.role);
  const admin = isAdmin(role);

  const query = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.getById(productId),
    enabled: Boolean(productId),
  });

  if (query.isLoading) {
    return <Card><p className="text-sm opacity-70">Loading product...</p></Card>;
  }

  if (query.error || !query.data) {
    return <ErrorState message="Unable to load product details" onRetry={() => query.refetch()} />;
  }

  const product = query.data;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Product Details</h2>
        <div className="flex gap-2">
          <Link to="/products"><Button variant="secondary">Back</Button></Link>
          {admin ? <Link to={`/products/${product.id}/edit`}><Button>Edit Product</Button></Link> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Detail label="Name" value={product.name} />
        <Detail label="SKU" value={product.sku} />
        <Detail label="Barcode" value={product.barcode || "-"} />
        <Detail label="Category" value={product.category} />
        <Detail label="Price" value={formatCurrency(product.price)} />
        <Detail label="Available Stock" value={String(product.stock)} />
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-3 dark:border-white/20">
      <p className="text-xs uppercase opacity-60">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
