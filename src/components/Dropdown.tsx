import { ChevronDown, Check } from "lucide-react";
import { KeyboardEvent, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onTriggerKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  inputRef?: (element: HTMLInputElement | null) => void;
  triggerRef?: (element: HTMLButtonElement | null) => void;
}

export function Dropdown({
  value,
  options,
  placeholder = "Select",
  searchable = false,
  required,
  className,
  onChange,
  onKeyDown,
  onTriggerKeyDown,
  inputRef,
  triggerRef,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((item) => item.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((item) => item.label.toLowerCase().includes(term));
  }, [options, query]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-left text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexo-accent/70",
          required && !value ? "border-red-400" : "",
          "dark:border-white/20 dark:bg-[#213124]",
        )}
        onClick={() => setOpen((state) => !state)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={selected ? "" : "opacity-60"}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-black/10 bg-white p-2 shadow-card dark:border-white/20 dark:bg-[#243426]">
          {searchable ? (
            <input
              ref={inputRef}
              className="mb-2 w-full rounded-lg border border-black/10 bg-white/80 px-2 py-1 text-sm outline-none focus:border-nexo-accent dark:border-white/20 dark:bg-[#213124]"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          ) : null}

          <div className="max-h-44 overflow-auto">
            {filtered.length === 0 ? (
              <p className="px-2 py-1 text-xs opacity-70">No results found</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span>{item.label}</span>
                  {item.value === value ? <Check size={14} /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
