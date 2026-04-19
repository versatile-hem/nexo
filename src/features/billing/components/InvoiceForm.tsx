import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Autocomplete, AutocompleteOption } from "@/components/Autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InvoiceCustomer,
  InvoiceItemInput,
  InvoiceLineCalculated,
  InvoiceProduct,
} from "@/services/invoiceService";

interface InvoiceFormProps {
  customers: InvoiceCustomer[];
  products: InvoiceProduct[];
  selectedCustomerId: string;
  customerSearch: string;
  customerLoading: boolean;
  customerError?: string;
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  items: InvoiceItemInput[];
  lines: InvoiceLineCalculated[];
  isSaving: boolean;
  onCustomerChange: (customerId: string) => void;
  onCustomerSearchChange: (value: string) => void;
  onRetryCustomers: () => void;
  onCreateCustomer: (payload: {
    name: string;
    phone: string;
    gstin: string;
    address: string;
    state: string;
  }) => Promise<void>;
  onInvoiceDateChange: (value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onItemChange: (index: number, patch: Partial<InvoiceItemInput>) => void;
  onSubmit: () => void;
}

export function InvoiceForm({
  customers,
  products,
  selectedCustomerId,
  customerSearch,
  customerLoading,
  customerError,
  invoiceNumber,
  invoiceDate,
  placeOfSupply,
  items,
  lines,
  isSaving,
  onCustomerChange,
  onCustomerSearchChange,
  onRetryCustomers,
  onCreateCustomer,
  onInvoiceDateChange,
  onAddRow,
  onRemoveRow,
  onItemChange,
  onSubmit,
}: InvoiceFormProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    gstin: "",
    address: "",
    state: "",
  });

  const onTaxInputEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onAddRow();
    }
  };

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);
  const customerOptions: AutocompleteOption[] = useMemo(
    () => [
      ...customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
        description: customer.gstin ? `GSTIN: ${customer.gstin}` : "GSTIN: -",
      })),
      { value: "__add_new__", label: "+ Add New Customer", description: "Create customer inline" },
    ],
    [customers],
  );

  const onCreateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError(null);

    if (!newCustomer.name.trim() || !newCustomer.phone.trim() || !newCustomer.gstin.trim() || !newCustomer.address.trim() || !newCustomer.state.trim()) {
      setCreateError("All customer fields are required.");
      return;
    }

    setCreateLoading(true);
    try {
      await onCreateCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        gstin: newCustomer.gstin.trim(),
        address: newCustomer.address.trim(),
        state: newCustomer.state.trim(),
      });
      setCreateOpen(false);
      setNewCustomer({ name: "", phone: "", gstin: "", address: "", state: "" });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create customer");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Customer</label>
          <Autocomplete
            value={customerSearch}
            options={customerOptions}
            loading={customerLoading}
            placeholder="Search customer by name / GSTIN"
            onChange={onCustomerSearchChange}
            onSelect={(option) => {
              if (option.value === "__add_new__") {
                setCreateOpen(true);
                return;
              }
              onCustomerChange(option.value);
              onCustomerSearchChange(option.label);
            }}
          />
          {customerError ? (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-900/30 dark:text-red-100">
              <p>{customerError}</p>
              <button type="button" className="mt-1 underline" onClick={onRetryCustomers}>Retry</button>
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Invoice Number</label>
          <Input value={invoiceNumber} readOnly />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Invoice Date</label>
          <Input type="date" value={invoiceDate} onChange={(e) => onInvoiceDateChange(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Place of Supply</label>
          <Input value={placeOfSupply} readOnly />
        </div>
      </div>

      {selectedCustomer ? (
        <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm transition-all duration-200 dark:border-white/20 dark:bg-white/5">
          <p className="font-semibold">{selectedCustomer.name}</p>
          <p className="opacity-70">{selectedCustomer.billingAddress}</p>
          <p className="opacity-70">GSTIN: {selectedCustomer.gstin}</p>
          <p className="opacity-70">Phone: {selectedCustomer.phone || "-"}</p>
          <p className="opacity-70">State: {selectedCustomer.state || "-"}</p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/20">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-[#edf3e6] text-xs uppercase dark:bg-[#203022]">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">HSN</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Unit Price</th>
              <th className="p-2 text-right">Discount</th>
              <th className="p-2 text-right">Tax Rate %</th>
              <th className="p-2 text-right">Tax Amount</th>
              <th className="p-2 text-right">Total Amount</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const line = lines[index];
              const invalidQty = item.qty <= 0;
              const invalidPrice = item.unitPrice <= 0;

              return (
                <tr key={`line-${index}`} className="border-t border-black/5 dark:border-white/10">
                  <td className="p-2">
                    <select
                      className="w-full rounded-lg border border-black/10 bg-white/80 px-2 py-2 dark:border-white/20 dark:bg-[#213124]"
                      value={item.productId ?? ""}
                      onChange={(e) => {
                        const selected = products.find((product) => product.id === e.target.value);
                        onItemChange(index, {
                          productId: selected?.id,
                          productName: selected?.name ?? item.productName,
                          hsn: selected?.hsn ?? item.hsn,
                          unitPrice: selected?.price ?? item.unitPrice,
                        });
                      }}
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                    {!item.productName ? <p className="mt-1 text-xs text-red-600">Product required</p> : null}
                  </td>
                  <td className="p-2">
                    <Input value={item.hsn} onChange={(e) => onItemChange(index, { hsn: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      className={invalidQty ? "border-red-400" : "text-right"}
                      value={item.qty}
                      onChange={(e) => onItemChange(index, { qty: Number(e.target.value) || 0 })}
                    />
                    {invalidQty ? <p className="mt-1 text-xs text-red-600">Qty must be &gt; 0</p> : null}
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      className={invalidPrice ? "border-red-400" : "text-right"}
                      value={item.unitPrice}
                      onChange={(e) => onItemChange(index, { unitPrice: Number(e.target.value) || 0 })}
                    />
                    {invalidPrice ? <p className="mt-1 text-xs text-red-600">Price must be &gt; 0</p> : null}
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      className="text-right"
                      value={item.discount}
                      onChange={(e) => onItemChange(index, { discount: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      className="text-right"
                      value={item.taxRate}
                      onChange={(e) => onItemChange(index, { taxRate: Number(e.target.value) || 0 })}
                      onKeyDown={onTaxInputEnter}
                    />
                  </td>
                  <td className="p-2 text-right">{line ? line.taxAmount.toFixed(2) : "0.00"}</td>
                  <td className="p-2 text-right font-semibold">{line ? line.totalAmount.toFixed(2) : "0.00"}</td>
                  <td className="p-2">
                    <button
                      type="button"
                      className="rounded-md p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => onRemoveRow(index)}
                      aria-label="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <Button className="gap-2" onClick={onAddRow}>
          <Plus size={14} /> Add Line Item
        </Button>
        <Button onClick={onSubmit} disabled={isSaving}>{isSaving ? "Saving..." : "Save Invoice"}</Button>
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/45" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-auto p-3 sm:flex sm:items-center sm:justify-center">
            <div className="min-h-full rounded-xl bg-white p-4 shadow-card dark:bg-[#1f2b20] sm:min-h-0 sm:w-full sm:max-w-lg">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">+ Add New Customer</h3>
                <button type="button" className="rounded-md px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setCreateOpen(false)}>
                  Close
                </button>
              </div>

              <form className="grid gap-3" onSubmit={onCreateSubmit}>
                <Input placeholder="Name" value={newCustomer.name} onChange={(e) => setNewCustomer((s) => ({ ...s, name: e.target.value }))} />
                <Input placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer((s) => ({ ...s, phone: e.target.value }))} />
                <Input placeholder="GSTIN" value={newCustomer.gstin} onChange={(e) => setNewCustomer((s) => ({ ...s, gstin: e.target.value }))} />
                <Input placeholder="Address" value={newCustomer.address} onChange={(e) => setNewCustomer((s) => ({ ...s, address: e.target.value }))} />
                <Input placeholder="State" value={newCustomer.state} onChange={(e) => setNewCustomer((s) => ({ ...s, state: e.target.value }))} />

                {createError ? <p className="text-xs text-red-600">{createError}</p> : null}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createLoading}>{createLoading ? "Creating..." : "Create Customer"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
