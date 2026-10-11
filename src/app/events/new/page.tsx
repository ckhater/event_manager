"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { EventForm } from "@/components/event-form";
import { useAuth } from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/copy";

export default function NewEventPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p className="text-sm text-deep/60 dark:text-cream/60">
        {t.newPage.loading}
      </p>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-cream p-10 text-center dark:bg-white/[0.04]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-deep/5 dark:bg-white/10">
          <Lock className="h-6 w-6 text-deep/50 dark:text-cream/50" />
        </span>
        <h1 className="mt-3 text-xl font-extrabold">{t.newPage.lockedTitle}</h1>
        <p className="mt-1 text-sm text-deep/60 dark:text-cream/60">
          {t.newPage.lockedText}
        </p>
        <Link href="/login" className="mt-4 inline-block">
          <Button>{t.newPage.loginCta}</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-4"
    >
      <h1 className="text-2xl font-extrabold">{t.newPage.title}</h1>
      <p className="text-sm text-deep/60 dark:text-cream/60">
        {t.newPage.subtitle}
      </p>
      <EventForm mode="create" />
    </motion.div>
  );
}
