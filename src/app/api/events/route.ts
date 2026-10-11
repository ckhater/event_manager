import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { eventSchema, eventsQuerySchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

// GET /api/events — public, filters + sorting, counts registrations.
export const GET = handle(async (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const q = eventsQuerySchema.parse(params);

  const and: Prisma.EventWhereInput[] = [];
  const now = new Date();

  if (q.q) {
    and.push({
      OR: [
        { title: { contains: q.q, mode: "insensitive" } },
        { description: { contains: q.q, mode: "insensitive" } },
        { location: { contains: q.q, mode: "insensitive" } },
      ],
    });
  }
  if (q.location) {
    and.push({ location: { contains: q.location, mode: "insensitive" } });
  }

  // Status is driven by the END date: an event is upcoming until it ends.
  if (q.status === "upcoming") and.push({ endDate: { gte: now } });
  else if (q.status === "past") and.push({ endDate: { lt: now } });

  // Date window uses overlap semantics: [from, to] intersects [start, end].
  if (q.from) and.push({ endDate: { gte: new Date(`${q.from}T00:00:00`) } });
  if (q.to) and.push({ startDate: { lte: new Date(`${q.to}T23:59:59.999`) } });

  const where: Prisma.EventWhereInput = and.length > 0 ? { AND: and } : {};

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: q.sort === "date_desc" ? "desc" : "asc" },
    include: { _count: { select: { registrations: true } } },
  });

  const shaped = events
    .map((e) => ({
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
    }))
    .filter((e) => (q.available ? e.spotsLeft > 0 && !e.isPast : true));

  return ok({ events: shaped });
});

// POST /api/events — admin only.
export const POST = handle(async (req: NextRequest) => {
  await requireAdmin();
  const json: unknown = await req.json();
  const data = eventSchema.parse(json);
  const event = await prisma.event.create({ data });
  return ok(
    {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        capacity: event.capacity,
        imageUrl: event.imageUrl,
        registrationsCount: 0,
        spotsLeft: event.capacity,
      },
    },
    { status: 201 },
  );
});
