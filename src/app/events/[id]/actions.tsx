"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/navbar";
import { apiFetch, type ApiError } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { EventListItem, RegistrationItem } from "@/components/types";

/** Signed-in booking: one click, booked under the account identity. */
export function RegistrationForm({
  event,
  onRegistered,
}: {
  event: EventListItem;
  onRegistered: (r: RegistrationItem) => void;
}) {
  const { user } = useAuth();
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);

  const disabled = event.isPast || event.spotsLeft <= 0;
  if (disabled) return null;

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-deep/5 dark:bg-white/10">
          <LogIn className="h-6 w-6 text-deep/60 dark:text-cream/60" />
        </span>
        <h2 className="mt-3 font-extrabold text-deep dark:text-cream">
          {t.register.loginRequiredTitle}
        </h2>
        <p className="mt-1 text-sm text-deep/60 dark:text-cream/60">
          {t.register.loginRequiredText}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/login">
            <Button size="sm">{t.register.loginCta}</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" variant="secondary">
              {t.register.signupCta}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      // Identity comes from the session server-side; one account = one seat.
      const data = await apiFetch<{ registration: RegistrationItem }>(
        `/api/events/${event.id}/registrations`,
        { method: "POST" },
      );
      setMessage({ kind: "ok", text: t.register.success });
      onRegistered(data.registration);
    } catch (err) {
      const api = err as ApiError;
      setMessage({ kind: "err", text: api.message });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-extrabold text-deep dark:text-cream">
        {t.register.title}
      </h2>
      <p className="mb-1 text-sm text-deep/60 dark:text-cream/60">
        {t.register.remaining(event.spotsLeft)}
      </p>
      <p className="mb-4 rounded-xl bg-deep/[0.04] px-3 py-2 text-sm text-deep/70 dark:bg-white/[0.06] dark:text-cream/70">
        {t.register.bookingAs}{" "}
        <span className="font-bold text-deep dark:text-cream">
          {user.name}
        </span>{" "}
        · {user.email}
      </p>
      <form onSubmit={(e) => void submit(e)} noValidate>
        {message ? (
          <p
            className={
              message.kind === "ok"
                ? "mb-3 rounded-xl bg-sage/20 px-4 py-2 text-sm font-semibold text-deep dark:text-sage"
                : "mb-3 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
            }
          >
            {message.text}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t.register.pending : t.register.submit}
        </Button>
      </form>
    </Card>
  );
}

/** Shown instead of the booking form when the user already registered. */
export function AlreadyRegistered() {
  return (
    <Card className="border-sage/40 p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/20">
        <CheckCircle2 className="h-6 w-6 text-deep dark:text-sage" />
      </span>
      <h2 className="mt-3 font-extrabold text-deep dark:text-cream">
        {t.register.alreadyTitle}
      </h2>
      <p className="mt-1 text-sm text-deep/60 dark:text-cream/60">
        {t.register.alreadyText}
      </p>
    </Card>
  );
}

/** Admin buttons: Edit / Delete (with confirmation). */
export function AdminActions({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");

  if (user?.role !== "ADMIN") return null;

  async function remove(): Promise<void> {
    setPending(true);
    setError("");
    try {
      await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch {
      setError(t.adminActions.error);
      setPending(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => router.push(`/events/${eventId}/edit`)}
      >
        {t.adminActions.edit}
      </Button>
      <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
        {t.adminActions.delete}
      </Button>
      {error ? <p className="w-full text-sm text-rose-600">{error}</p> : null}
      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.adminActions.confirmTitle}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-deep/60 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-cream p-6 shadow-2xl dark:bg-deep">
            <h2 className="text-lg font-bold">{t.adminActions.confirmTitle}</h2>
            <p className="mt-1 text-sm text-deep/60 dark:text-cream/60">
              {t.adminActions.confirmText}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
              >
                {t.adminActions.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={() => void remove()}
                disabled={pending}
              >
                {pending ? t.adminActions.pending : t.adminActions.confirm}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
