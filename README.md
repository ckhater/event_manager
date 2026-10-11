# Event Manager

Event Manager is a web application that allows Admin to create and manage events. Regular users can browse available events and register to attend them. Only admin can create events, regular users do not have permission to create them.
## Technologies used

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + strict TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens, class-based dark mode) + hand-rolled `cva` UI primitives (`src/components/ui`) |
| Database | PostgreSQL (Neon) via Prisma v6 |
| Validation | Zod (every server input; custom English messages, no raw Zod defaults) |
| Auth | HS256 JWT in httpOnly `SameSite=Lax` cookies (`jose`), bcryptjs password hashing |
| Images | Vercel Blob object storage (`POST /api/upload`, admin-only, 4 MB max) |
| Motion | Framer Motion (cards, badges, gauge, hero glows) + `ogl` WebGL ambient background |
| Deploy target | Vercel (app + Blob) + Neon (Postgres) — all free tiers |

## Installation steps

Prerequisites: Node 20+, a free [Neon](https://neon.tech) project (Postgres), a free Vercel account (only needed for Blob uploads + deploy).

```bash
npm install
cp .env.example .env   # then fill every value (see below)
npx prisma migrate dev # creates tables (uses DIRECT_URL)
npm run db:seed        # creates the admin (needs SEED_* in .env)
npm run dev            # http://localhost:3000
```

`.env` values:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon → Connect → **pooled** URL (`-pooler` host) + `&pgbouncer=true`. Percent-encode `# @ / ? % :` if they appear in the password |
| `DIRECT_URL` | Neon → Connect → **direct** URL (no `-pooler`). `pgbouncer=true` goes on `DATABASE_URL` only |
| `AUTH_SECRET` | `openssl rand -base64 32` (32+ chars, server refuses to boot without it) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | You choose; admin login + required at boot |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Create → Blob. Store access must be **public** or uploads fail |

Useful scripts: `npm run typecheck` (strict `tsc`), `npm run build` (`prisma generate && next build`), `npm start`, `npm run db:deploy` (`migrate deploy`, for a separate prod DB).

To wipe events on an existing DB: `psql "$DIRECT_URL" -c 'DELETE FROM "Event";'` (registrations cascade).

## Project architecture

```
src/
  app/
    page.tsx                  home: hero, filters, animated card grid
    layout.tsx                fonts, theme script, providers, navbar, footer
    login/  signup/           auth pages (friendly copy, inline errors)
    events/new                admin-only create page
    events/[id]/              detail: hero, gauge, booking column
    events/[id]/edit          admin-only edit page
    api/
      auth/signup|login|logout|me
      events                  list (filters/sort/counts) + create (admin)
      events/[id]             read (public) + update/delete (admin)
      events/[id]/registrations       list (admin) + book (login, race-safe)
      events/[id]/registrations/me    own booking (login)
      events/[id]/registrations/[registrationId]  unregister (admin)
      upload                  cover upload to Vercel Blob (admin)
  components/
    ui/            Button, Input, Textarea, Select, Badge, Card, Dialog, Label, Skeleton
    event-card.tsx, status-badge.tsx (sage LIVE / maroon count / red full / gray past),
    capacity-gauge.tsx, filters.tsx, event-form.tsx (dates + cover upload),
    registrants-table.tsx, navbar.tsx, theme-provider.tsx,
    ambient-background.tsx + prismatic-burst.tsx (WebGL backdrop)
  lib/
    prisma.ts (singleton) · http.ts (HttpError + JSON wrapper) ·
    auth.ts (session + requireUser/requireAdmin, role re-read from DB) ·
    validation.ts (Zod schemas) · copy.ts (all English copy) ·
    format.ts (en-US dates, ranges) · env.ts (boot-time gate via instrumentation.ts) ·
    api-client.ts (fetch wrapper throwing { message, fieldErrors })
prisma/  schema.prisma · migrations/ · seed.ts (admin only, refuses without SEED_*)
```

Key rules: authorization is enforced server-side only (client merely hides); registration requires login with identity taken from the session; booking is race-safe (`SELECT … FOR UPDATE` + unique `[eventId, email]`); event IDs are unguessable cuids; login errors are indistinguishable; every date stored is a UTC instant (browser converts `datetime-local` before sending) and displayed in the viewer's zone.
