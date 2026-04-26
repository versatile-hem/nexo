import { KeyboardEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Autocomplete, AutocompleteOption } from "@/components/Autocomplete";
import { Dropdown, DropdownOption } from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyOpsOrderRow, ProductOption } from "@/mocks/types";
import { cn } from "@/utils/cn";

const courierOptions: DropdownOption[] = [
  { value: "Shadowfax", label: "Shadowfax" },
  { value: "Delhivery", label: "Delhivery" },
  { value: "Xpressbees", label: "Xpressbees" },
  { value: "Ekart", label: "Ekart" },
  { value: "Amazon Shipping", label: "Amazon Shipping" },
  { value: "Other", label: "Other" },
];

const unitOptions: DropdownOption[] = [
  { value: "nos", label: "nos" },
  { value: "box", label: "box" },
  { value: "packet", label: "packet" },
];

interface OrdersTableProps {
  rows: DailyOpsOrderRow[];
  products: ProductOption[];
  productLoading: boolean;
  onAddRow: () => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, patch: Partial<DailyOpsOrderRow>) => void;
  registerRef: (key: string, element: HTMLInputElement | HTMLButtonElement | null) => void;
  onKeyNav: (
    event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
    section: "orders",
    rowIndex: number,
    colIndex: number,
    colsCount: number,
  ) => void;
}

export function OrdersTable({
  rows,
  products,
  productLoading,
  onAddRow,
  onDelete,
  onUpdate,
  registerRef,
  onKeyNav,
}: OrdersTableProps) {
  const options: AutocompleteOption[] = products.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.sku,
  }));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Orders</h3>
        <Button className="gap-2" onClick={onAddRow}>
          <Plus size={14} /> Add Row
        </Button>
      </div>

      <div className="h-[400px] overflow-y-auto overflow-x-auto rounded-xl border border-black/10 dark:border-white/20">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#edf3e6] text-xs uppercase tracking-wide dark:bg-[#203022]">
            <tr>
              <th className="px-3 py-3">Courier</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Unit</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const invalidProduct = row.productName.trim().length === 0;
              const invalidQty = row.qty <= 0;

              return (
                <tr key={`order-${index}`} className="border-t border-black/5 align-top hover:bg-black/[0.02] dark:border-white/10 dark:hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <Dropdown
                      searchable
                      required
                      value={row.courier}
                      options={courierOptions}
                      placeholder="Select courier"
                      triggerRef={(el) => registerRef(`orders-${index}-0`, el)}
                      onTriggerKeyDown={(e) => onKeyNav(e, "orders", index, 0, 4)}
                      onChange={(value) => onUpdate(index, { courier: value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Autocomplete
                      value={row.productName}
                      options={options}
                      loading={productLoading}
                      placeholder="Search product or type manually"
                      invalid={invalidProduct}
                      inputRef={(el) => registerRef(`orders-${index}-1`, el)}
                      onChange={(value) => onUpdate(index, { productId: undefined, productName: value })}
                      onSelect={(option) =>
                        onUpdate(index, { productId: option.value, productName: option.label })
                      }
                      onKeyDown={(e) => onKeyNav(e, "orders", index, 1, 4)}
                    />
                    {invalidProduct ? <p className="mt-1 text-xs text-red-600">Product is required</p> : null}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      ref={(el) => registerRef(`orders-${index}-2`, el)}
                      type="number"
                      min={1}
                      value={row.qty}
                      className={cn(invalidQty ? "border-red-400 focus:border-red-500" : "")}
                      onChange={(e) => onUpdate(index, { qty: Number(e.target.value) || 0 })}
                      onKeyDown={(e) => onKeyNav(e, "orders", index, 2, 4)}
                    />
                    {invalidQty ? <p className="mt-1 text-xs text-red-600">Quantity must be greater than 0</p> : null}
                  </td>
                  <td className="px-3 py-2">
                    <Dropdown
                      value={row.unit}
                      options={unitOptions}
                      triggerRef={(el) => registerRef(`orders-${index}-3`, el)}
                      onTriggerKeyDown={(e) => onKeyNav(e, "orders", index, 3, 4)}
                      onChange={(value) => onUpdate(index, { unit: value as DailyOpsOrderRow["unit"] })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-100 dark:hover:bg-red-900/30"
                      aria-label="Delete row"
                      onClick={() => onDelete(index)}
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
    </div>
  );
}
