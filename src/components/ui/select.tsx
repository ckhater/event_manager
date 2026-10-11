import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full cursor-pointer rounded-xl border bg-deep/[0.04] px-3 py-2 text-sm text-deep shadow-sm backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-sage dark:bg-white/[0.06] dark:text-cream [&>option]:bg-cream dark:[&>option]:bg-deep",
          error ? "border-rose-400" : "border-deep/15 dark:border-cream/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
