import { Loader2 } from "lucide-react";
import { KeyboardEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteProps {
  value: string;
  options: AutocompleteOption[];
  placeholder?: string;
  loading?: boolean;
  className?: string;
  invalid?: boolean;
  inputRef?: (element: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function Autocomplete({
  value,
  options,
  placeholder,
  loading,
  className,
  invalid,
  inputRef,
  onChange,
  onSelect,
  onKeyDown,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return options.slice(0, 8);
    return options
      .filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.description?.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [options, value]);

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        className={invalid ? "border-red-400 focus:border-red-500" : ""}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open ? (
        <div className="absolute z-40 mt-1 w-full rounded-xl border border-black/10 bg-white p-2 shadow-card dark:border-white/20 dark:bg-[#243426]">
          {loading ? (
            <div className="flex items-center gap-2 px-2 py-2 text-xs opacity-80">
              <Loader2 size={14} className="animate-spin" />
              Loading products...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-2 py-2 text-xs opacity-70">No results found</div>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                <p>{option.label}</p>
                {option.description ? <p className="text-xs opacity-60">{option.description}</p> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
