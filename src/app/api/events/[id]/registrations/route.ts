import { NextRequest } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { apiT } from "@/lib/copy";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/:id/registrations — admin: attendee list.
export const GET = handle(async (_req: NextRequest, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new HttpError(404, apiT.eventNotFound);
  const registrations = await prisma.registration.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
  });
  return ok({ registrations });
});

// POST /api/events/:id/registrations — login required, race-safe.
// Identity comes from the session (one account = one seat).
export const POST = handle(async (_req: NextRequest, ctx: Ctx) => {
  const me = await requireUser();
  const { id } = await ctx.params;

  const registration = await prisma.$transaction(async (tx) => {
    // Lock the Event row: concurrent requests wait here, so the
    // capacity check cannot be bypassed by a race.
    const locked: Array<{ id: string; capacity: number; endDate: Date }> =
      await tx.$queryRaw`
        SELECT id, capacity, "endDate" FROM "Event" WHERE id = ${id} FOR UPDATE
      `;
    const row = locked[0];
    if (!row) throw new HttpError(404, apiT.eventNotFound);
    if (row.endDate.getTime() < Date.now()) {
      throw new HttpError(409, apiT.eventPast);
    }

    const existing = await tx.registration.findUnique({
      where: { eventId_email: { eventId: id, email: me.email } },
    });
    if (existing) {
      throw new HttpError(409, apiT.alreadyRegistered);
    }

    const count = await tx.registration.count({ where: { eventId: id } });
    if (count >= row.capacity) {
      throw new HttpError(409, apiT.eventFull);
    }

    return tx.registration.create({
      data: { name: me.name, email: me.email, eventId: id, userId: me.id },
    });
  });

  return ok({ registration }, { status: 201 });
});
