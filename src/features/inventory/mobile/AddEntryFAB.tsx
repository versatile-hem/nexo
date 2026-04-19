import { Plus } from "lucide-react";

interface AddEntryFABProps {
  onClick: () => void;
}

export function AddEntryFAB({ onClick }: AddEntryFABProps) {
  return (
    <button
      type="button"
      className="fixed bottom-16 right-4 z-30 flex min-h-12 items-center gap-2 rounded-full bg-nexo-accent px-4 text-sm font-semibold text-white shadow-card"
      onClick={onClick}
      aria-label="Add entry"
    >
      <Plus size={16} />
      + Add
    </button>
  );
}
