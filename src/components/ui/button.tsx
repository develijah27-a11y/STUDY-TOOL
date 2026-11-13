import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#0B192C] text-white shadow-sm hover:bg-[#162942] active:scale-[0.99]",
        amber:
          "bg-amber-500 text-slate-950 shadow-sm hover:bg-amber-400 active:scale-[0.99]",
        emerald:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-[11px]",
        lg: "h-12 rounded-xl px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

