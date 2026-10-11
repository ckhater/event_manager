import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        success:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
        danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
        muted:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        admin: "bg-maroon text-cream",
        live: "bg-sage text-deep",
        maroon: "bg-maroon text-cream",
        user: "bg-sage/25 text-deep dark:bg-sage/20 dark:text-sage",
        info: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
