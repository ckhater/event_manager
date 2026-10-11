"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Card } from "./ui/card";
import { t } from "@/lib/copy";
import type { EventFilters } from "./types";
import { DEFAULT_FILTERS } from "./types";

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: EventFilters;
  onChange: (f: EventFilters) => void;
}) {
  function set<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label htmlFor="q">{t.filters.search}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-deep/40 dark:text-cream/40" />
            <Input
              id="q"
              placeholder={t.filters.searchPlaceholder}
              value={filters.q}
              onChange={(e) => set("q", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="location">{t.filters.location}</Label>
          <Input
            id="location"
            placeholder={t.filters.locationPlaceholder}
            value={filters.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sort">{t.filters.sort}</Label>
          <Select
            id="sort"
            value={filters.sort}
            onChange={(e) =>
              set("sort", e.target.value as EventFilters["sort"])
            }
          >
            <option value="date_asc">{t.filters.sortAsc}</option>
            <option value="date_desc">{t.filters.sortDesc}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">{t.filters.period}</Label>
          <Select
            id="status"
            value={filters.status}
            onChange={(e) =>
              set("status", e.target.value as EventFilters["status"])
            }
          >
            <option value="upcoming">{t.filters.upcoming}</option>
            <option value="past">{t.filters.past}</option>
            <option value="all">{t.filters.all}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="from">{t.filters.from}</Label>
          <Input
            id="from"
            type="date"
            value={filters.from}
            onChange={(e) => set("from", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="to">{t.filters.to}</Label>
          <Input
            id="to"
            type="date"
            value={filters.to}
            onChange={(e) => set("to", e.target.value)}
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-deep dark:text-cream">
            <input
              type="checkbox"
              checked={filters.available}
              onChange={(e) => set("available", e.target.checked)}
              className="h-4 w-4 accent-[#0E2931] dark:accent-[#7ABC98]"
            />
            {t.filters.availableOnly}
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...DEFAULT_FILTERS })}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t.filters.reset}
        </Button>
      </div>
    </Card>
  );
}
