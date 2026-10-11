"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { FilterPanel } from "@/components/filters";
import { EmptyState } from "@/components/empty-state";
import { EventCardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/navbar";
import { apiFetch } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { EventFilters, EventListItem } from "@/components/types";
import { DEFAULT_FILTERS } from "@/components/types";

function useDebounced<T>(value: T, delayMs: number): T {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

function toQuery(f: EventFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.location.trim()) p.set("location", f.location.trim());
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  p.set("status", f.status);
  if (f.available) p.set("available", "true");
  p.set("sort", f.sort);
  return p.toString();
}

export default function HomePage() {
  const { user } = useAuth();
  const [filters, setFilters] = React.useState<EventFilters>(DEFAULT_FILTERS);
  const debounced = useDebounced(filters, 300);
  const [events, setEvents] = React.useState<EventListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch<{ events: EventListItem[] }>(`/api/events?${toQuery(debounced)}`, {
      cache: "no-store",
    })
      .then((d) => {
        if (!cancelled) setEvents(d.events);
      })
      .catch(() => {
        if (!cancelled) setError(t.hero.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="relative overflow-hidden rounded-2xl bg-cream/20 dark:bg-deep/20 backdrop-blur-sm p-6 text-deep dark:text-cream shadow-sm shadow-deep/30 dark:shadow-black/50 sm:rounded-3xl sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
        />
     
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-sage/25 px-3 py-1 text-xs font-boldtext-deep dark:text-cream backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-sage" /> {t.hero.badge}
          </p>
          <h1 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-4xl">
            {t.hero.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-deep/60 dark:text-cream/60 sm:text-base">
            {t.hero.subtitle}
          </p>
        </div>
      </section>

      <FilterPanel filters={filters} onChange={setFilters} />

      {error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      <section
        aria-live="polite"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))
        ) : events.length === 0 ? (
          <EmptyState isAdmin={user?.role === "ADMIN"} />
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </AnimatePresence>
        )}
      </section>
    </motion.div>
  );
}
