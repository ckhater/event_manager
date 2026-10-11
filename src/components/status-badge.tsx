"use client";

import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { t } from "@/lib/copy";
import type { EventListItem } from "./types";

function Dot({ className }: { className: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${className}`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${className}`} />
    </span>
  );
}

/** True while the event is happening right now (start <= now <= end). */
function isLive(event: EventListItem, now: number): boolean {
  return (
    new Date(event.startDate).getTime() <= now &&
    now <= new Date(event.endDate).getTime()
  );
}

/**
 * Status badge: sage LIVE while happening, maroon with the spots-left
 * count while upcoming, red when full, gray when past.
 */
export function StatusBadge({ event }: { event: EventListItem }) {
  const now = Date.now();

  if (event.isPast) {
    return (
      <Badge variant="muted">
        <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
        {t.status.past}
      </Badge>
    );
  }
  if (isLive(event, now)) {
    return (
      <motion.span
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="inline-flex"
      >
        <Badge variant="live" dot>
          {t.status.live}
        </Badge>
      </motion.span>
    );
  }
  if (event.spotsLeft <= 0) {
    return (
      <Badge variant="danger" dot>
        {t.status.full}
      </Badge>
    );
  }
  return (
    <motion.span
      key={`spots-${event.spotsLeft}`}
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      className="inline-flex"
    >
      <Badge variant="maroon" dot>
        {t.status.spotsLeft(event.spotsLeft)}
      </Badge>
    </motion.span>
  );
}
