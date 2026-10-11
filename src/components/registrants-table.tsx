"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { apiFetch } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { RegistrationItem } from "./types";

export function RegistrantsTable({
  eventId,
  initial,
}: {
  eventId: string;
  initial: RegistrationItem[];
}) {
  const [rows, setRows] = React.useState(initial);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  // Re-sync when the page reloads server data.
  React.useEffect(() => setRows(initial), [initial]);

  async function unregister(id: string): Promise<void> {
    setPendingId(id);
    setError("");
    try {
      await apiFetch(`/api/events/${eventId}/registrations/${id}`, {
        method: "DELETE",
      });
      setRows((r) => r.filter((x) => x.id !== id));
    } catch {
      setError(t.registrants.error);
    } finally {
      setPendingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-deep/60 dark:text-cream/60">
        {t.registrants.empty}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-deep/10 px-5 py-3 dark:border-cream/10">
        <h3 className="font-bold text-deep dark:text-cream">
          {t.registrants.title(rows.length)}
        </h3>
      </div>
      {error ? (
        <p className="bg-rose-50 px-5 py-2 text-sm text-rose-700">{error}</p>
      ) : null}
      <ul className="divide-y divide-deep/10 dark:divide-cream/10">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-deep dark:text-cream">
                {r.name}
              </p>
              <p className="truncate text-xs text-deep/50 dark:text-cream/50">
                {r.email}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void unregister(r.id)}
              disabled={pendingId === r.id}
              aria-label={t.registrants.unregisterOf(r.name)}
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
              {pendingId === r.id ? "…" : t.registrants.remove}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
