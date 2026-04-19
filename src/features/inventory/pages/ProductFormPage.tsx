import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/services/productsApi";
import { validateProductForm } from "@/utils/validation";

export function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const editing = Boolean(productId);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", sku: "", price: 0, stock: 0, category: "", barcode: "" });

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => productsApi.getById(productId!),
    enabled: editing,
  });

  useEffect(() => {
    if (productQuery.data) {
      const product = productQuery.data;
      setForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        category: product.category,
        barcode: product.barcode || "",
      });
    }
  }, [productQuery.data]);

  const mutation = useMutation({
    mutationFn: () => {
      if (editing && productId) {
        return productsApi.update(productId, {
          name: form.name,
          sku: form.sku,
          barcode: form.barcode,
          price: form.price,
          category: form.category,
          availableStock: form.stock,
        });
      }

      return productsApi.create({
        name: form.name,
        sku: form.sku,
        barcode: form.barcode,
        price: form.price,
        category: form.category,
        availableStock: form.stock,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(editing ? "Product updated" : "Product created");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to save product");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateProductForm({
      name: form.name,
      sku: form.sku,
      price: form.price,
      category: form.category,
    });

    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    mutation.mutate();
  };

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">{editing ? "Update Product" : "Add Product"}</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <Input placeholder="Product name" value={form.name} required onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        <Input placeholder="SKU" value={form.sku} required onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} />
        <Input type="number" placeholder="Price" value={form.price} required onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))} />
        <Input type="number" placeholder="Opening stock" value={form.stock} required onChange={(e) => setForm((s) => ({ ...s, stock: Number(e.target.value) }))} />
        <Input placeholder="Category" value={form.category} required onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} />
        <Input placeholder="Barcode" value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value }))} />
        <div className="md:col-span-2">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : editing ? "Update Product" : "Save Product"}</Button>
        </div>
      </form>
    </Card>
  );
}
