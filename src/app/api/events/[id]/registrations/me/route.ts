import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { apiT } from "@/lib/copy";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/events/:id/registrations/me — signed-in user's own
// registration for this event (matched by account or email),
// or { registration: null }. Powers the "already registered" card.
export const GET = handle(async (_req: NextRequest, ctx: Ctx) => {
  const me = await requireUser();
  const { id } = await ctx.params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new HttpError(404, apiT.eventNotFound);

  const registration = await prisma.registration.findFirst({
    where: {
      eventId: id,
      OR: [{ userId: me.id }, { email: me.email }],
    },
  });
  return ok({ registration });
});
