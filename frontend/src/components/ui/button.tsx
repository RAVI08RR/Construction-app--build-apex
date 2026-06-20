import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const getVariantClass = (v: string) => {
      switch (v) {
        case "destructive":
          return "bg-accent-rose text-white shadow-sm hover:bg-accent-rose/90";
        case "outline":
          return "border border-slate-200 dark:border-slate-800 bg-transparent shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50";
        case "secondary":
          return "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm hover:bg-slate-100/80 dark:hover:bg-slate-800/80";
        case "ghost":
          return "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50";
        case "link":
          return "text-brand-500 underline-offset-4 hover:underline";
        default:
          return "bg-brand-500 text-white shadow hover:bg-brand-600";
      }
    };

    const getSizeClass = (s: string) => {
      switch (s) {
        case "sm":
          return "h-8 rounded-lg px-3 text-xs";
        case "lg":
          return "h-10 rounded-lg px-8";
        case "icon":
          return "h-9 w-9";
        default:
          return "h-9 px-4 py-2";
      }
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-bold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          getVariantClass(variant),
          getSizeClass(size),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
