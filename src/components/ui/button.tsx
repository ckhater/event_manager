import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          " shadow-lg shadow-deep/25 hover:shadow-xl hover:-translate-y-0.5 bg-sage text-deep dark:shadow-sage/20",
        secondary:
          "bg-cream text-deep border border-deep/15 shadow-sm hover:shadow-md hover:-translate-y-0.5 dark:bg-white/5 dark:text-cream dark:border-cream/20",
        accent:
          "bg-sage text-deep shadow-lg shadow-sage/30 hover:shadow-xl hover:-translate-y-0.5",
        ghost:
          "text-deep/70 hover:bg-deep/5 hover:text-deep dark:text-cream/70 dark:hover:bg-white/10 dark:hover:text-cream",
        destructive:
          "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5",
        outline:
          "border-2 border-sage/60 text-deep hover:bg-sage/15 dark:text-cream dark:hover:bg-sage/10",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-2xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
