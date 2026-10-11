"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "./ui/card";
import { StatusBadge } from "./status-badge";
import { CapacityGauge } from "./capacity-gauge";
import { formatShort, formatTime, formatMonthShort } from "@/lib/format";
import type { EventListItem } from "./types";


export function BannerFallback() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(rgba(14,41,49,0.16)_1.2px,transparent_1.2px)] bg-[size:18px_18px] dark:hidden "
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-[radial-gradient(rgba(248,248,236,0.16)_1.2px,transparent_1.2px)] bg-[size:18px_18px] dark:block"
      />
    </>
  );
}

export function EventCard({
  event,
  index = 0,
}: {
  event: EventListItem;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <Link href={`/events/${event.id}`} className="block">
        <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-deep/15 dark:hover:shadow-black/40">
          <div className="relative flex h-40 items-end justify-between overflow-hidden border-b border-deep/10 bg-cream/60 p-4 dark:border-cream/10 dark:bg-deep/60">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index === 0}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <BannerFallback />
            )}

            <span
              className={
                event.imageUrl
                  ? "relative rounded-xl bg-white/20 px-3 py-1.5 text-center text-white backdrop-blur-md"
                  : "relative rounded-xl bg-deep/80 px-3 py-1.5 text-center text-cream dark:bg-cream dark:text-deep bg-blur-lg"
              }
            >
              <span className="block text-lg font-extrabold leading-none">
                {new Date(event.startDate).getDate()}
              </span>
              <span className="block text-[11px] font-medium capitalize">
                {formatMonthShort(event.startDate)}
              </span>
            </span>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 font-bold leading-snug text-deep transition-colors group-hover:text-maroon dark:text-cream dark:group-hover:text-sage">
                {event.title}
              </h3>
            </div>
            <StatusBadge event={event} />
            <p className="line-clamp-2 text-sm text-deep/60 dark:text-cream/60">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-deep/60 dark:text-cream/60">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatShort(event.startDate)} · {formatTime(event.startDate)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event.registrationsCount}/{event.capacity}
              </span>
            </div>
            <CapacityGauge
              registrationsCount={event.registrationsCount}
              capacity={event.capacity}
            />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
