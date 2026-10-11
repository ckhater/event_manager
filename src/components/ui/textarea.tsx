import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-24 w-full rounded-xl border bg-deep/[0.04] px-3 py-2 text-sm text-deep shadow-sm backdrop-blur transition-all placeholder:text-deep/35 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage dark:bg-white/[0.06] dark:text-cream dark:placeholder:text-cream/35",
          error ? "border-rose-400" : "border-deep/15 dark:border-cream/15",
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
Textarea.displayName = "Textarea";

export { Textarea };
