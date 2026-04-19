import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/Dropdown";
import { db } from "@/mocks/data";
import { customerService, CustomerRecord } from "@/services/customerService";
import { productsApi } from "@/services/productsApi";
import { salesService } from "@/services/salesService";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/format";

export function CreateOrderPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const customersQuery = useQuery({
    queryKey: ["sales-customers"],
    queryFn: async () => {
      try {
        return await customerService.getCustomers();
      } catch {
        return db.customers.map((item) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          email: item.email,
          billingAddress: item.billingAddress,
          gstin: item.gstin,
          state: item.state,
        } satisfies CustomerRecord));
      }
    },
  });

  const productsQuery = useQuery({
    queryKey: ["sales-products"],
    queryFn: async () => {
      try {
        return await productsApi.list();
      } catch {
        return db.products.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          barcode: item.barcode,
          category: item.category,
          stock: item.stock,
        }));
      }
    },
  });

  const selectedCustomer = useMemo(
    () => (customersQuery.data ?? []).find((item) => item.id === customerId),
    [customersQuery.data, customerId],
  );

  const selectedProduct = useMemo(
    () => (productsQuery.data ?? []).find((item) => item.id === productId),
    [productsQuery.data, productId],
  );

  const total = useMemo(() => Math.max(0, quantity * unitPrice), [quantity, unitPrice]);

  const createMutation = useMutation({
    mutationFn: () =>
      salesService.createOrder({
        customerId,
        customerName: selectedCustomer?.name ?? "Unknown Customer",
        createdBy: user?.name ?? "Sales User",
        items: [
          {
            productId,
            productName: selectedProduct?.name ?? "Product",
            quantity,
            unitPrice,
          },
        ],
      }),
    onSuccess: () => {
      toast.success("Order created successfully");
      navigate("/sales/orders");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to create order");
    },
  });

  const onSubmit = () => {
    if (!customerId || !productId) {
      toast.error("Select customer and product");
      return;
    }

    if (quantity <= 0 || unitPrice <= 0) {
      toast.error("Quantity and price must be greater than 0");
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Take Order</h2>
        <p className="mt-1 text-sm opacity-70">Fast mobile-friendly order capture for field sales.</p>
      </Card>

      <Card className="space-y-4 p-4 sm:p-5">
        <div>
          <p className="mb-1 text-xs uppercase opacity-70">Customer</p>
          <Dropdown
            value={customerId}
            searchable
            options={(customersQuery.data ?? []).map((item) => ({ value: item.id, label: `${item.name} (${item.phone})` }))}
            placeholder="Select customer"
            onChange={setCustomerId}
          />
        </div>

        {selectedCustomer ? (
          <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm dark:border-white/20 dark:bg-white/5">
            <p className="font-semibold">{selectedCustomer.name}</p>
            <p className="opacity-70">{selectedCustomer.phone}</p>
            <p className="opacity-70">{selectedCustomer.billingAddress}</p>
          </div>
        ) : null}

        <div>
          <p className="mb-1 text-xs uppercase opacity-70">Product</p>
          <Dropdown
            value={productId}
            searchable
            options={(productsQuery.data ?? []).map((item) => ({ value: item.id, label: `${item.name} (${item.sku})` }))}
            placeholder="Select product"
            onChange={(value) => {
              setProductId(value);
              const product = (productsQuery.data ?? []).find((item) => item.id === value);
              setUnitPrice(product?.price ?? 0);
            }}
          />
        </div>

        <div className="grid gap-3 grid-cols-2">
          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Quantity</p>
            <Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 0)} />
          </div>
          <div>
            <p className="mb-1 text-xs uppercase opacity-70">Unit Price</p>
            <Input type="number" min={0} value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value) || 0)} />
          </div>
        </div>

        <div className="rounded-xl border-2 border-nexo-accent/40 bg-nexo-accent/5 p-4">
          <p className="text-xs uppercase opacity-70">Order Total</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>

        <Button className="h-12 w-full text-base" onClick={onSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Order"}
        </Button>
      </Card>
    </div>
  );
}
