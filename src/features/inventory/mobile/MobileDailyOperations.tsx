import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownOption } from "@/components/Dropdown";
import { DailyOpsOrderRow, DailyOpsReturnRow, ProductOption, SalesChannel } from "@/mocks/types";
import { AddEntryFAB } from "@/features/inventory/mobile/AddEntryFAB";
import { BottomSummaryBar } from "@/features/inventory/mobile/BottomSummaryBar";
import { EntryCard } from "@/features/inventory/mobile/EntryCard";
import { ModeTabs } from "@/features/inventory/mobile/ModeTabs";
import { ParserBottomSheet } from "@/features/inventory/mobile/ParserBottomSheet";

interface MobileDailyOperationsProps {
  date: string;
  channel: SalesChannel;
  channelOptions: DropdownOption[];
  orders: DailyOpsOrderRow[];
  returns: DailyOpsReturnRow[];
  products: ProductOption[];
  productsLoading: boolean;
  rawInput: string;
  parseLoading: boolean;
  saveLoading: boolean;
  summary: {
    totalOrdersQty: number;
    totalReturnsQty: number;
    netStockImpact: number;
  };
  onDateChange: (date: string) => void;
  onChannelChange: (channel: SalesChannel) => void;
  onParseInputChange: (value: string) => void;
  onParse: () => void;
  onSave: () => void;
  onAddOrderRow: () => void;
  onAddReturnRow: () => void;
  onUpdateOrderRow: (index: number, patch: Partial<DailyOpsOrderRow>) => void;
  onUpdateReturnRow: (index: number, patch: Partial<DailyOpsReturnRow>) => void;
  onDeleteOrderRow: (index: number) => void;
  onDeleteReturnRow: (index: number) => void;
}

export function MobileDailyOperations({
  date,
  channel,
  channelOptions,
  orders,
  returns,
  products,
  productsLoading,
  rawInput,
  parseLoading,
  saveLoading,
  summary,
  onDateChange,
  onChannelChange,
  onParseInputChange,
  onParse,
  onSave,
  onAddOrderRow,
  onAddReturnRow,
  onUpdateOrderRow,
  onUpdateReturnRow,
  onDeleteOrderRow,
  onDeleteReturnRow,
}: MobileDailyOperationsProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"orders" | "returns">("orders");
  const [parserOpen, setParserOpen] = useState(false);
  const [focusOrderIndex, setFocusOrderIndex] = useState<number | null>(null);
  const [focusReturnIndex, setFocusReturnIndex] = useState<number | null>(null);

  const addRow = () => {
    if (mode === "orders") {
      const next = orders.length;
      onAddOrderRow();
      setFocusOrderIndex(next);
      return;
    }

    const next = returns.length;
    onAddReturnRow();
    setFocusReturnIndex(next);
  };

  return (
    <div className="space-y-3 pb-28">
      <header className="sticky top-0 z-30 rounded-xl bg-white/95 p-3 shadow-card backdrop-blur dark:bg-[#1d2a1f]/95">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-semibold">Daily Ops</h1>
          <Button className="min-h-10 gap-1 px-3" onClick={onSave} disabled={saveLoading}>
            <Save size={14} />
            {saveLoading ? "Saving" : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input className="min-h-11" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
          <Dropdown
            value={channel}
            options={channelOptions}
            className="[&>button]:min-h-11"
            onChange={(value) => onChannelChange(value as SalesChannel)}
          />
        </div>
      </header>

      <ModeTabs mode={mode} onChange={setMode} />

      <div className="space-y-3">
        {mode === "orders"
          ? orders.map((row, index) => (
              <EntryCard
                key={`mobile-order-${index}`}
                mode="orders"
                row={row}
                index={index}
                products={products}
                productLoading={productsLoading}
                autoFocus={focusOrderIndex === index}
                onDelete={onDeleteOrderRow}
                onUpdate={onUpdateOrderRow}
                onAddNext={addRow}
              />
            ))
          : returns.map((row, index) => (
              <EntryCard
                key={`mobile-return-${index}`}
                mode="returns"
                row={row}
                index={index}
                products={products}
                productLoading={productsLoading}
                autoFocus={focusReturnIndex === index}
                onDelete={onDeleteReturnRow}
                onUpdate={onUpdateReturnRow}
                onAddNext={addRow}
              />
            ))}
      </div>

      <div className="fixed bottom-16 left-3 z-30">
        <Button variant="secondary" className="min-h-11" onClick={() => setParserOpen(true)}>Paste Data</Button>
      </div>

      <AddEntryFAB onClick={addRow} />

      <BottomSummaryBar
        totalOrdersQty={summary.totalOrdersQty}
        totalReturnsQty={summary.totalReturnsQty}
        netStockImpact={summary.netStockImpact}
      />

      <ParserBottomSheet
        open={parserOpen}
        value={rawInput}
        parsing={parseLoading}
        onChange={onParseInputChange}
        onClose={() => setParserOpen(false)}
        onParse={() => {
          onParse();
          setParserOpen(false);
          setMode("orders");
        }}
      />
    </div>
  );
}
