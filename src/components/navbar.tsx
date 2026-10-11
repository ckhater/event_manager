"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-provider";
import { apiFetch, type ApiError } from "@/lib/api-client";
import { t } from "@/lib/copy";
import type { PublicUser } from "./types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<PublicUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const data = await apiFetch<{ user: PublicUser | null }>(
        "/api/auth/me",
        { cache: "no-store" },
      );
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthContext = React.createContext<{
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: PublicUser | null) => void;
}>({ user: null, loading: false, refresh: async () => {}, setUser: () => {} });

export function useAuth(): {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: PublicUser | null) => void;
} {
  return React.useContext(AuthContext);
}

export function Navbar() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function logout(): Promise<void> {
    setBusy(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setBusy(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-deep/10 bg-cream/80 shadow-sm backdrop-blur-xl dark:border-cream/10 dark:bg-deep/80"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-maroon/20 bg-blur-sm  font-serif text-sm tracking-wide dark:text-cream ring-1 ring-sage/40">
            EM
          </span>
          <span className="hidden font-serif text-lg tracking-wide text-deep min-[420px]:block dark:text-cream">
            {t.brand}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-deep/50 dark:text-cream/50">
              {t.nav.loading}
            </span>
          ) : user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link href="/events/new">
                  <Button size="sm" variant="accent">
                    <Plus className="h-4 w-4" /> {t.nav.newEvent}
                  </Button>
                </Link>
              ) : null}
              <span className="hidden items-center gap-2 sm:flex">
                <span className="text-sm font-semibold text-deep dark:text-cream">
                  {user.name}
                </span>
                <Badge variant={user.role === "ADMIN" ? "admin" : "user"}>
                  {user.role === "ADMIN" ? t.nav.admin : t.nav.member}
                </Badge>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void logout()}
                disabled={busy}
              >
                <LogOut className="h-4 w-4" /> {t.nav.logout}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">{t.nav.signup}</Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}

export function asApiErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as ApiError).message === "string"
  ) {
    return (err as ApiError).message;
  }
  return "Something went wrong.";
}
