"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { apiFetch, type ApiError } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { EventListItem } from "./types";

interface Props {
  mode: "create" | "edit";
  initial?: EventListItem;
}

const MAX_BYTES = 4 * 1024 * 1024;

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    "status" in err
  );
}

/** Converts an ISO date to a datetime-local « YYYY-MM-DDTHH:mm » value. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * datetime-local carries no timezone, so the browser (which knows the
 * admin's zone) must convert to an ISO UTC instant BEFORE sending.
 * Otherwise the server would interpret "18:00" in ITS zone (UTC on
 * Vercel) and shift the event by the admin's UTC offset.
 */
function toISOInstant(local: string): string {
  if (!local) return local;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? local : d.toISOString();
}

export function EventForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [description, setDescription] = React.useState(
    initial?.description ?? "",
  );
  const [startDate, setStartDate] = React.useState(
    initial ? toLocalInput(initial.startDate) : "",
  );
  const [endDate, setEndDate] = React.useState(
    initial ? toLocalInput(initial.endDate) : "",
  );
  const [location, setLocation] = React.useState(initial?.location ?? "");
  const [capacity, setCapacity] = React.useState(
    initial ? String(initial.capacity) : "",
  );
  // Cover image: kept URL (edit mode), staged File (new upload), or preview.
  const [keptUrl, setKeptUrl] = React.useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const [staged, setStaged] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [globalError, setGlobalError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Revoke object URLs on unmount / replacement to avoid leaks.
  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function first(key: string): string | undefined {
    return fieldErrors[key]?.[0];
  }

  function onFile(file: File | undefined): void {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setGlobalError("Image must be 4 MB or smaller.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setGlobalError("Only image files are accepted.");
      return;
    }
    setGlobalError("");
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setStaged(file);
    setKeptUrl(null);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage(): void {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setStaged(null);
    setKeptUrl(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadStaged(): Promise<string | null> {
    if (!staged) return keptUrl;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", staged);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof body === "object" && body !== null && "error" in body
            ? String((body as { error: unknown }).error)
            : "Image upload failed.";
        throw new Error(msg);
      }
      const url =
        typeof body === "object" && body !== null && "url" in body
          ? String((body as { url: unknown }).url)
          : null;
      return url;
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});
    setGlobalError("");
    try {
      const imageUrl = await uploadStaged();
      const payload = {
        title,
        description,
        startDate: toISOInstant(startDate),
        endDate: toISOInstant(endDate),
        location,
        imageUrl: imageUrl ?? "",
        capacity: Number(capacity),
      };
      if (mode === "create") {
        const data = await apiFetch<{ event: EventListItem }>("/api/events", {
          method: "POST",
          json: payload,
        });
        router.push(`/events/${data.event.id}`);
      } else {
        const data = await apiFetch<{ event: EventListItem }>(
          `/api/events/${initial?.id}`,
          { method: "PUT", json: payload },
        );
        router.push(`/events/${data.event.id}`);
      }
      router.refresh();
    } catch (err: unknown) {
      if (isApiError(err)) {
        setFieldErrors(err.fieldErrors ?? {});
        setGlobalError(err.message);
      } else if (err instanceof Error) {
        setGlobalError(err.message);
      } else {
        setGlobalError("Something went wrong.");
      }
    } finally {
      setPending(false);
    }
  }

  const busy = pending || uploading;

  return (
    <Card className="p-6">
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="title">{t.eventForm.title}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.eventForm.titlePlaceholder}
            error={first("title")}
          />
        </div>
        <div>
          <Label htmlFor="description">{t.eventForm.description}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.eventForm.descriptionPlaceholder}
            rows={5}
            error={first("description")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="startDate">{t.eventForm.startDate}</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={first("startDate")}
            />
          </div>
          <div>
            <Label htmlFor="endDate">{t.eventForm.endDate}</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={first("endDate")}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="location">{t.eventForm.location}</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.eventForm.locationPlaceholder}
            error={first("location")}
          />
        </div>
        <div>
          <Label htmlFor="capacity">{t.eventForm.capacity}</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            max={100000}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="50"
            error={first("capacity")}
          />
        </div>
        <div>
          <Label>{t.eventForm.coverImage}</Label>
          <input
            ref={fileRef}
            id="cover"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-deep/10 dark:border-cream/10">
              <Image
                src={preview}
                alt="Event cover preview"
                width={800}
                height={300}
                className="h-44 w-full object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={busy}
                className="absolute right-2 top-2 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-deep/70 px-2.5 py-1.5 text-xs font-semibold text-deep dark:text-cream backdrop-blur transition hover:bg-deep/90"
              >
                <X className="h-3.5 w-3.5" /> {t.eventForm.coverRemove}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-sage/50 px-6 py-8 text-sm text-deep/60 transition hover:border-sage hover:bg-sage/10 dark:text-cream/60"
            >
              <ImagePlus className="h-6 w-6 text-sage" />
              {t.eventForm.coverImage}
              <span className="text-xs">{t.eventForm.coverHint}</span>
            </button>
          )}
        </div>
        {globalError ? (
          <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {globalError}
          </p>
        ) : null}
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={busy}>
            {uploading
              ? t.eventForm.uploading
              : pending
                ? t.eventForm.pending
                : mode === "create"
                  ? t.eventForm.create
                  : t.eventForm.save}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={busy}
          >
            {t.eventForm.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
