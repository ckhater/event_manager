"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { t } from "@/lib/copy";

/**
 * Animated fill gauge: color shifts green → amber → red,
 * gently pulsing when almost full.
 */
export function CapacityGauge({
  registrationsCount,
  capacity,
  className,
}: {
  registrationsCount: number;
  capacity: number;
  className?: string;
}) {
  const ratio =
    capacity <= 0 ? 0 : Math.min(1, registrationsCount / capacity);
  const pct = Math.round(ratio * 100);
  const almostFull = ratio >= 0.85 && ratio < 1;
  const full = ratio >= 1;

  const bar = full
    ? "from-rose-500 to-red-500"
    : ratio >= 0.85
      ? "from-amber-400 to-orange-500"
      : ratio >= 0.5
        ? "from-amber-300 to-amber-500"
        : "from-sage to-emerald-600";

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-center justify-between text-xs font-medium">
        <span className="text-deep/60 dark:text-cream/60">
          {t.gauge.registered(registrationsCount, capacity)}
        </span>
        <span
          className={cn(
            "font-bold",
            full
              ? "text-rose-600"
              : ratio >= 0.85
                ? "text-amber-600"
                : "text-emerald-700 dark:text-sage",
          )}
        >
          {pct} %
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.gauge.registered(registrationsCount, capacity)}
        className={cn(
          "h-2 overflow-hidden rounded-full bg-deep/10 dark:bg-white/10",
          almostFull && "animate-pulse",
        )}
      >
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", bar)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </div>
      {almostFull ? (
        <p className="mt-1 text-xs font-semibold text-amber-600">
          {t.gauge.almostFull}
        </p>
      ) : null}
    </div>
  );
}
