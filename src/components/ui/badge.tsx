import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#0B192C] text-white",
        amber: "bg-amber-100 text-amber-900 border border-amber-200",
        emerald: "bg-emerald-50 text-emerald-800 border border-emerald-200",
        slate: "bg-slate-100 text-slate-800 border border-slate-200",
        destructive: "bg-red-50 text-red-800 border border-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

