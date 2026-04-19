import { Button } from "@/components/ui/button";

interface ParserBottomSheetProps {
  open: boolean;
  value: string;
  parsing: boolean;
  onChange: (value: string) => void;
  onParse: () => void;
  onClose: () => void;
}

export function ParserBottomSheet({
  open,
  value,
  parsing,
  onChange,
  onParse,
  onClose,
}: ParserBottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40" role="dialog" aria-modal="true">
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 dark:bg-[#1f2b20]">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Paste Data</h3>
          <button type="button" className="text-xs opacity-70" onClick={onClose}>Close</button>
        </div>
        <textarea
          className="min-h-36 w-full rounded-xl border border-black/10 bg-white/80 p-3 text-sm outline-none focus:border-nexo-accent dark:border-white/20 dark:bg-[#213124]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="w-full" onClick={onClose}>Cancel</Button>
          <Button className="w-full" onClick={onParse} disabled={parsing}>{parsing ? "Parsing..." : "Parse Input"}</Button>
        </div>
      </div>
    </div>
  );
}
