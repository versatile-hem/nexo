import { useEffect, useRef } from "react";
import { useState } from "react";
import { Camera, PlusCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Autocomplete, AutocompleteOption } from "@/components/Autocomplete";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Dropdown, DropdownOption } from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyOpsOrderRow, DailyOpsReturnRow, DailyOpsUnit, ProductOption } from "@/mocks/types";

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

interface EntryCardProps {
  mode: "orders" | "returns";
  row: DailyOpsOrderRow | DailyOpsReturnRow;
  index: number;
  products: ProductOption[];
  productLoading: boolean;
  autoFocus?: boolean;
  onDelete: (index: number) => void;
  onUpdate: (index: number, patch: Partial<DailyOpsOrderRow | DailyOpsReturnRow>) => void;
  onAddNext: () => void;
}

export function EntryCard({
  mode,
  row,
  index,
  products,
  productLoading,
  autoFocus,
  onDelete,
  onUpdate,
  onAddNext,
}: EntryCardProps) {
  const navigate = useNavigate();
  const productRef = useRef<HTMLInputElement | null>(null);
  const qtyRef = useRef<HTMLInputElement | null>(null);
  const unitRef = useRef<HTMLButtonElement | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScan, setLastScan] = useState<{ code: string; name?: string } | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);

  const options: AutocompleteOption[] = products.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.sku,
  }));

  useEffect(() => {
    if (autoFocus) {
      productRef.current?.focus();
    }
  }, [autoFocus]);

  const handleBarcodeDetected = (barcode: string) => {
    const matched = products.find((item) => item.barcode === barcode);

    if (!matched) {
      setNotFoundBarcode(barcode);
      setLastScan({ code: barcode });
      onUpdate(index, { barcode, productId: undefined });
      toast.error("Product not found");
      return;
    }

    setNotFoundBarcode(null);
    setLastScan({ code: barcode, name: matched.name });
    onUpdate(index, { productId: matched.id, productName: matched.name, barcode });
    requestAnimationFrame(() => qtyRef.current?.focus());
    toast.success(`Scanned: ${matched.name}`);
  };

  return (
    <article className="space-y-3 rounded-xl border border-black/10 bg-white/85 p-3 shadow-card dark:border-white/20 dark:bg-[#213124]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase opacity-70">{mode === "orders" ? "Order" : "Return"} #{index + 1}</p>
        <button
          type="button"
          className="rounded-md p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
          onClick={() => onDelete(index)}
          aria-label="Delete entry"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {mode === "orders" ? (
        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Courier</label>
          <Dropdown
            searchable
            required
            value={(row as DailyOpsOrderRow).courier}
            options={courierOptions}
            className="[&>button]:min-h-11"
            onChange={(value) => onUpdate(index, { courier: value })}
          />
        </div>
      ) : null}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-xs uppercase opacity-70">Product</label>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 gap-1 px-2 text-xs"
            onClick={() => setScannerOpen(true)}
          >
            <Camera size={13} />
            <span>📷 Scan Barcode</span>
          </Button>
        </div>
        <Autocomplete
          value={row.productName}
          options={options}
          loading={productLoading}
          placeholder="Search product"
          inputRef={(el) => {
            productRef.current = el;
          }}
          className="[&_input]:min-h-11"
          invalid={!row.productName.trim()}
          onChange={(value) => onUpdate(index, { productId: undefined, productName: value })}
          onSelect={(option) => onUpdate(index, { productId: option.value, productName: option.label })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              qtyRef.current?.focus();
            }
          }}
        />

        {lastScan ? (
          <p className="mt-2 text-xs opacity-75">
            Last scanned: <span className="font-semibold">{lastScan.code}</span>
            {lastScan.name ? <span className="opacity-80"> ({lastScan.name})</span> : null}
          </p>
        ) : null}

        {notFoundBarcode ? (
          <div className="mt-2 rounded-lg border border-amber-300/60 bg-amber-50 px-2 py-2 text-xs text-amber-900 dark:border-amber-600/50 dark:bg-amber-900/25 dark:text-amber-100">
            <p>Product not found for barcode {notFoundBarcode}.</p>
            <button
              type="button"
              className="mt-1 inline-flex items-center gap-1 font-semibold text-amber-800 underline dark:text-amber-200"
              onClick={() => navigate("/products/new")}
            >
              <PlusCircle size={12} /> Create New Product
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Quantity</label>
          <Input
            ref={qtyRef}
            className="min-h-11"
            type="number"
            min={1}
            value={row.qty}
            onChange={(e) => onUpdate(index, { qty: Number(e.target.value) || 0 })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                unitRef.current?.focus();
              }
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase opacity-70">Unit</label>
          <Dropdown
            value={row.unit}
            options={unitOptions}
            className="[&>button]:min-h-11"
            triggerRef={(el) => {
              unitRef.current = el;
            }}
            onChange={(value) => onUpdate(index, { unit: value as DailyOpsUnit })}
            onTriggerKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddNext();
              }
            }}
          />
        </div>
      </div>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />
    </article>
  );
}
