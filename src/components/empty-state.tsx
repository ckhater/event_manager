"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "./ui/button";
import { t } from "@/lib/copy";

export function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-sage/50 bg-cream px-6 py-16 text-center dark:border-sage/30 dark:bg-white/[0.03]"
    >
      <motion.span
        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage/20"
        aria-hidden
      >
        <CalendarPlus className="h-8 w-8 text-deep dark:text-sage" />
      </motion.span>
      <h2 className="text-xl font-extrabold text-deep dark:text-cream">
        {t.empty.title}
      </h2>
      <p className="max-w-md text-sm text-deep/60 dark:text-cream/60">
        {t.empty.text}
      </p>
      {isAdmin ? (
        <Link href="/events/new">
          <Button variant="accent">{t.empty.ctaAdmin}</Button>
        </Link>
      ) : <></>}
    </motion.div>
  );
}
