import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/services/inventoryService";

export function ProductFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", sku: "", price: 0, stock: 0, category: "", batchCode: "" });

  const mutation = useMutation({
    mutationFn: inventoryService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
      navigate("/products");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Add Product</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <Input placeholder="Product name" required onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        <Input placeholder="SKU" required onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} />
        <Input type="number" placeholder="Price" required onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))} />
        <Input type="number" placeholder="Opening stock" required onChange={(e) => setForm((s) => ({ ...s, stock: Number(e.target.value) }))} />
        <Input placeholder="Category" required onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} />
        <Input placeholder="Batch code" onChange={(e) => setForm((s) => ({ ...s, batchCode: e.target.value }))} />
        <div className="md:col-span-2">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Product"}</Button>
        </div>
      </form>
    </Card>
  );
}
