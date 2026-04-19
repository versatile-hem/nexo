import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-nexo-accent text-white hover:brightness-95",
  secondary: "bg-white/80 text-nexo-ink hover:bg-white",
  ghost: "bg-transparent text-nexo-ink hover:bg-nexo-accentSoft",
  danger: "bg-nexo-danger text-white hover:brightness-95",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        "rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
