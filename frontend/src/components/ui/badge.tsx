import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "emerald" | "rose" | "blue" | "violet";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const getVariantClass = (v: string) => {
    switch (v) {
      case "secondary":
        return "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 border-transparent";
      case "outline":
        return "text-slate-950 dark:text-slate-50 border border-slate-200 dark:border-slate-800";
      case "emerald":
        return "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/25";
      case "rose":
        return "bg-accent-rose/15 text-accent-rose border-accent-rose/25";
      case "blue":
        return "bg-accent-blue/15 text-accent-blue border-accent-blue/25";
      case "violet":
        return "bg-accent-violet/15 text-accent-violet border-accent-violet/25";
      default:
        return "bg-brand-500/10 border-brand-500/25 text-brand-500";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider transition-colors",
        getVariantClass(variant),
        className
      )}
      {...props}
    />
  )
}

export { Badge }
