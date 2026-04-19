import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-nexo-accent dark:border-white/20 dark:bg-[#213124]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
