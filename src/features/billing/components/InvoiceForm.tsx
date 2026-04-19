import { KeyboardEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  items: InvoiceItemInput[];
  lines: InvoiceLineCalculated[];
  isSaving: boolean;
  onCustomerChange: (customerId: string) => void;
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
  invoiceNumber,
  invoiceDate,
  placeOfSupply,
  items,
  lines,
  isSaving,
  onCustomerChange,
  onInvoiceDateChange,
  onAddRow,
  onRemoveRow,
  onItemChange,
  onSubmit,
}: InvoiceFormProps) {
  const onTaxInputEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onAddRow();
    }
  };

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Customer</label>
          <select
            className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm dark:border-white/20 dark:bg-[#213124]"
            value={selectedCustomerId}
            onChange={(e) => onCustomerChange(e.target.value)}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
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
        <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm dark:border-white/20 dark:bg-white/5">
          <p className="font-semibold">{selectedCustomer.name}</p>
          <p className="opacity-70">{selectedCustomer.billingAddress}</p>
          <p className="opacity-70">GSTIN: {selectedCustomer.gstin}</p>
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
    </div>
  );
}
