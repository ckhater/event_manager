"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CalendarX,
  MapPin,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { CapacityGauge } from "@/components/capacity-gauge";
import { RegistrantsTable } from "@/components/registrants-table";
import { useAuth } from "@/components/navbar";
import { apiFetch } from "@/lib/api-client";
import { formatDateRange } from "@/lib/format";
import { BannerFallback } from "@/components/event-card";
import { t } from "@/lib/copy";
import type {
  EventListItem,
  RegistrationItem,
} from "@/components/types";
import { RegistrationForm, AdminActions, AlreadyRegistered } from "./actions";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const [event, setEvent] = React.useState<EventListItem | null>(null);
  const [regs, setRegs] = React.useState<RegistrationItem[]>([]);
  const [myReg, setMyReg] = React.useState<RegistrationItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // The signed-in user's own registration (drives the "already
  // registered" card instead of the booking form).
  const loadMine = React.useCallback(async () => {
    if (!user) {
      setMyReg(null);
      return;
    }
    try {
      const data = await apiFetch<{ registration: RegistrationItem | null }>(
        `/api/events/${id}/registrations/me`,
        { cache: "no-store" },
      );
      setMyReg(data.registration);
    } catch {
      setMyReg(null);
    }
  }, [id, user]);

  React.useEffect(() => {
    void loadMine();
  }, [loadMine]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ event: EventListItem }>(
        `/api/events/${id}`,
        { cache: "no-store" },
      );
      setEvent(data.event);
      if (user?.role === "ADMIN") {
        try {
          const r = await apiFetch<{ registrations: RegistrationItem[] }>(
            `/api/events/${id}/registrations`,
            { cache: "no-store" },
          );
          setRegs(r.registrations);
        } catch {
          setRegs([]);
        }
      }
    } catch {
      setError(t.detail.notFoundTitle);
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-56 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-cream p-10 text-center dark:bg-white/[0.04]">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-deep/5 dark:bg-white/10">
          <CalendarX className="h-8 w-8 text-deep/50 dark:text-cream/50" />
        </span>
        <h1 className="mt-3 text-xl font-extrabold">{t.detail.notFoundTitle}</h1>
        <p className="mt-1 text-sm text-deep/60 dark:text-cream/60">
          {t.detail.notFoundText}
        </p>
        <Link href="/" className="mt-4 inline-block">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> {t.detail.backToList}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-semibold text-maroon hover:underline dark:text-sage"
      >
        <ArrowLeft className="h-4 w-4" /> {t.detail.allEvents}
      </Link>

      <div
        className={
          event.imageUrl
            ? "relative overflow-hidden rounded-3xl text-cream shadow-2xl"
            : "relative overflow-hidden rounded-3xl border border-deep/10 bg-cream text-deep shadow-2xl dark:border-cream/10 dark:bg-deep dark:text-cream"
        }
      >
        {event.imageUrl ? (
          <>
            <Image
              src={event.imageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"
            />
          </>
        ) : (
          <BannerFallback />
        )}
        <div className="relative p-6 sm:p-8">
          <StatusBadge event={event} />
          <h1 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl">
            {event.title}
          </h1>
          <div
            className={
              event.imageUrl
                ? "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-cream/90"
                : "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-deep/70 dark:text-cream/70"
            }
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDateRange(event.startDate, event.endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {t.detail.registeredCount(
                event.registrationsCount,
                event.capacity,
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Card className="p-6">
            <h2 className="font-extrabold">{t.detail.about}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-deep/70 dark:text-cream/70">
              {event.description}
            </p>
            <div className="mt-5">
              <CapacityGauge
                registrationsCount={event.registrationsCount}
                capacity={event.capacity}
              />
            </div>
            {event.isPast ? (
              <p className="mt-4 rounded-xl bg-deep/5 px-4 py-2 text-sm font-semibold text-deep/60 dark:bg-white/5 dark:text-cream/60">
                {t.detail.pastNote}
              </p>
            ) : event.spotsLeft <= 0 ? (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                {t.detail.fullNote}
              </p>
            ) : null}
          </Card>

          {user?.role === "ADMIN" ? (
            <div className="space-y-3">
              <AdminActions eventId={event.id} />
              <RegistrantsTable eventId={event.id} initial={regs} />
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          {myReg ? (
            <AlreadyRegistered />
          ) : event.isPast ? (
            <Card className="p-6 text-center text-sm text-deep/60 dark:text-cream/60">
              {t.detail.closedPast}
            </Card>
          ) : event.spotsLeft <= 0 ? (
            <Card className="p-6 text-center text-sm text-deep/60 dark:text-cream/60">
              {t.detail.closedFull}
            </Card>
          ) : (
            <RegistrationForm
              event={event}
              onRegistered={(r) => {
                setMyReg(r);
                void load();
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
