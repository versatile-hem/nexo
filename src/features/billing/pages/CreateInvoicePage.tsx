import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { InvoiceForm } from "@/features/billing/components/InvoiceForm";
import { InvoicePreview } from "@/features/billing/components/InvoicePreview";
import {
  companyProfile,
  InvoiceItemInput,
  invoiceService,
} from "@/services/invoiceService";

const defaultItem = (): InvoiceItemInput => ({
  productId: undefined,
  productName: "",
  hsn: "",
  qty: 1,
  unitPrice: 0,
  discount: 0,
  taxRate: 18,
});

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const customersQuery = useQuery({ queryKey: ["invoice-customers"], queryFn: invoiceService.getCustomers });
  const productsQuery = useQuery({ queryKey: ["invoice-products"], queryFn: invoiceService.getProducts });

  const [invoiceNumber] = useState(() => invoiceService.generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([defaultItem()]);

  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const customer = customers.find((item) => item.id === selectedCustomerId) ?? null;
  const placeOfSupply = customer?.state ?? "";

  const { lines, totals } = useMemo(
    () => invoiceService.calculateTotals(items, placeOfSupply || companyProfile.state),
    [items, placeOfSupply],
  );

  const createMutation = useMutation({
    mutationFn: () =>
      invoiceService.createInvoice({
        customer,
        invoiceNumber,
        invoiceDate,
        placeOfSupply,
        items,
      }),
    onSuccess: () => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate("/billing");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create invoice");
    },
  });

  const setItemPatch = (index: number, patch: Partial<InvoiceItemInput>) => {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const onSave = () => {
    if (!customer) {
      toast.error("Please select a customer");
      return;
    }

    const invalid = items.some((item) => !item.productName.trim() || item.qty <= 0 || item.unitPrice <= 0);
    if (invalid) {
      toast.error("Please fix line item errors before saving");
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <Card className="print-hide">
        <h2 className="mb-1 text-lg font-semibold">Create GST Invoice</h2>
        <p className="mb-4 text-sm opacity-70">GST-compliant invoice builder with automatic CGST/SGST/IGST calculation.</p>

        <InvoiceForm
          customers={customers}
          products={products}
          selectedCustomerId={selectedCustomerId}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          placeOfSupply={placeOfSupply}
          items={items}
          lines={lines}
          isSaving={createMutation.isPending}
          onCustomerChange={setSelectedCustomerId}
          onInvoiceDateChange={setInvoiceDate}
          onAddRow={() => setItems((prev) => [...prev, defaultItem()])}
          onRemoveRow={(index) =>
            setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
          }
          onItemChange={setItemPatch}
          onSubmit={onSave}
        />
      </Card>

      <div className="print-root">
        <InvoicePreview
          customer={customer}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          placeOfSupply={placeOfSupply}
          lines={lines}
          totals={totals}
        />
      </div>
    </div>
  );
}
