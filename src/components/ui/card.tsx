import { PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  className?: string;
}

export function Card({ className, children }: PropsWithChildren<CardProps>) {
  return (
    <section
      className={cn(
        "rounded-xl2 border border-black/5 bg-white/85 p-4 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-[#1f2b20]/80",
        className,
      )}
    >
      {children}
    </section>
  );
}
