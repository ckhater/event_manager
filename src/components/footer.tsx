"use client";

import Link from "next/link";
import { t } from "@/lib/copy";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12">
      {/* Gradient divider: content above, footer below. */}
      <div
        aria-hidden
        className="h-px bg-gradient-to-r from-transparent via-sage/60 to-transparent"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-8">

        <p className=" pt-4 text-center text-xs text-deep/40  dark:text-cream/40">
          © {year} {t.brand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
