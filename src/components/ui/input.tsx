import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border bg-deep/[0.04] px-3 py-2 text-sm text-deep shadow-sm backdrop-blur transition-all duration-200 placeholder:text-deep/35 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage dark:bg-white/[0.06] dark:text-cream dark:placeholder:text-cream/35",
          error
            ? "border-rose-400 focus:ring-rose-300"
            : "border-deep/15 dark:border-cream/15",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  ),
);
Input.displayName = "Input";

export { Input };
