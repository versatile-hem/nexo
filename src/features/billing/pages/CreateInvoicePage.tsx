import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/States";
import { InvoiceForm } from "@/features/billing/components/InvoiceForm";
import { InvoicePreview } from "@/features/billing/components/InvoicePreview";
import { useDebounce } from "@/hooks/useDebounce";
import { customerService } from "@/services/customerService";
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

  const [customerSearch, setCustomerSearch] = useState("");
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  const customersQuery = useQuery({
    queryKey: ["invoice-customers", debouncedCustomerSearch],
    queryFn: () => customerService.searchCustomers(debouncedCustomerSearch),
  });

  const productsQuery = useQuery({ queryKey: ["invoice-products"], queryFn: invoiceService.getProducts });

  const [invoiceNumber] = useState(() => invoiceService.generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([defaultItem()]);

  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const customerDetailsQuery = useQuery({
    queryKey: ["invoice-customer", selectedCustomerId],
    queryFn: () => customerService.getCustomerById(selectedCustomerId),
    enabled: Boolean(selectedCustomerId),
  });

  const customer = customerDetailsQuery.data ?? customers.find((item) => item.id === selectedCustomerId) ?? null;
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

  const createCustomerMutation = useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: (created) => {
      toast.success("Customer created");
      queryClient.invalidateQueries({ queryKey: ["invoice-customers"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-customers", debouncedCustomerSearch] });
      setSelectedCustomerId(created.id);
      setCustomerSearch(created.name);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to create customer");
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

  if (customersQuery.error) {
    return <ErrorState message="Failed to load customers" onRetry={() => customersQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <Card className="print-hide">
        <h2 className="mb-1 text-lg font-semibold">Create GST Invoice</h2>
        <p className="mb-4 text-sm opacity-70">GST-compliant invoice builder with automatic CGST/SGST/IGST calculation.</p>

        <InvoiceForm
          customers={customers}
          products={products}
          selectedCustomerId={selectedCustomerId}
          customerSearch={customerSearch}
          customerLoading={customersQuery.isLoading}
          customerError={customersQuery.error ? "Unable to load customers" : undefined}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          placeOfSupply={placeOfSupply}
          items={items}
          lines={lines}
          isSaving={createMutation.isPending}
          onCustomerChange={(customerId) => {
            setSelectedCustomerId(customerId);
          }}
          onCustomerSearchChange={setCustomerSearch}
          onRetryCustomers={() => customersQuery.refetch()}
          onCreateCustomer={async (payload) => {
            await createCustomerMutation.mutateAsync(payload);
          }}
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
