import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validation";
import { apiT } from "@/lib/copy";

type Ctx = { params: Promise<{ id: string }> };

function shape(
  e: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    capacity: number;
    imageUrl: string | null;
    _count: { registrations: number };
  },
): Record<string, unknown> {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    location: e.location,
    capacity: e.capacity,
    imageUrl: e.imageUrl,
    registrationsCount: e._count.registrations,
    spotsLeft: Math.max(0, e.capacity - e._count.registrations),
    isPast: e.endDate.getTime() < Date.now(),
  };
}

// GET /api/events/:id — public.
export const GET = handle(async (_req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) throw new HttpError(404, apiT.eventNotFound);
  return ok({ event: shape(event) });
});

// PUT /api/events/:id — admin. 409 when capacity < registrations.
export const PUT = handle(async (req: NextRequest, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const json: unknown = await req.json();
  const data = eventSchema.parse(json);

  const existing = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!existing) throw new HttpError(404, apiT.eventNotFound);

  if (data.capacity < existing._count.registrations) {
    throw new HttpError(
      409,
      apiT.capacityTooLow(existing._count.registrations),
    );
  }

  const event = await prisma.event.update({
    where: { id },
    data,
    include: { _count: { select: { registrations: true } } },
  });
  return ok({ event: shape(event) });
});

// DELETE /api/events/:id — admin.
export const DELETE = handle(async (_req: NextRequest, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, apiT.eventNotFound);
  await prisma.event.delete({ where: { id } });
  return ok({ ok: true });
});
