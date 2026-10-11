"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/navbar";
import { apiFetch, type ApiError } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { PublicUser } from "@/components/types";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [globalError, setGlobalError] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});
    setGlobalError("");
    try {
      await apiFetch<{ user: PublicUser }>("/api/auth/signup", {
        method: "POST",
        json: { name, email, password },
      });
      await refresh();
      router.push("/");
      router.refresh();
    } catch (err) {
      const api = err as ApiError;
      setFieldErrors(api.fieldErrors ?? {});
      setGlobalError(api.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md"
    >
      <Card className="p-8">
        <h1 className="mt-2 text-2xl font-extrabold">{t.signup.title}</h1>
        <p className="mt-1 text-sm text-deep/60 dark:text-cream/60">
          {t.signup.subtitle}
        </p>
        <form
          onSubmit={(e) => void submit(e)}
          className="mt-5 space-y-4"
          noValidate
        >
          <div>
            <Label htmlFor="name">{t.signup.name}</Label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.signup.namePlaceholder}
              error={fieldErrors.name?.[0]}
            />
          </div>
          <div>
            <Label htmlFor="email">{t.signup.email}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              error={fieldErrors.email?.[0]}
            />
          </div>
          <div>
            <Label htmlFor="password">{t.signup.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={fieldErrors.password?.[0]}
            />
          </div>
          {globalError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
              {globalError}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t.signup.pending : t.signup.submit}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-deep/60 dark:text-cream/60">
          {t.signup.hasAccount}{" "}
          <Link
            href="/login"
            className="font-bold text-maroon hover:underline dark:text-sage"
          >
            {t.signup.loginLink}
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
