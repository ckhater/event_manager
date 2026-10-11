"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { EventForm } from "@/components/event-form";
import { useAuth } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { EventListItem } from "@/components/types";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = React.useState<EventListItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let off = false;
    apiFetch<{ event: EventListItem }>(`/api/events/${id}`, {
      cache: "no-store",
    })
      .then((d) => {
        if (!off) setEvent(d.event);
      })
      .catch(() => {
        if (!off) setEvent(null);
      })
      .finally(() => {
        if (!off) setLoading(false);
      });
    return () => {
      off = true;
    };
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-cream p-10 text-center dark:bg-white/[0.04]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-deep/5 dark:bg-white/10">
          <Lock className="h-6 w-6 text-deep/50 dark:text-cream/50" />
        </span>
        <h1 className="mt-3 text-xl font-extrabold">{t.editPage.lockedTitle}</h1>
        <Link href="/login" className="mt-4 inline-block">
          <Button>{t.editPage.loginCta}</Button>
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-2xl bg-cream p-10 text-center dark:bg-white/[0.04]">
        <h1 className="text-xl font-extrabold">{t.editPage.notFound}</h1>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary">{t.editPage.back}</Button>
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
      <h1 className="text-2xl font-extrabold">{t.editPage.title}</h1>
      <EventForm mode="edit" initial={event} />
    </motion.div>
  );
}
