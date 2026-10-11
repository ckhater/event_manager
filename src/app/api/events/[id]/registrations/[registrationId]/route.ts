import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { apiT } from "@/lib/copy";

type Ctx = { params: Promise<{ id: string; registrationId: string }> };

// DELETE /api/events/:id/registrations/:registrationId — admin.
export const DELETE = handle(async (_req: NextRequest, ctx: Ctx) => {
  await requireAdmin();
  const { id, registrationId } = await ctx.params;
  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!reg || reg.eventId !== id) {
    throw new HttpError(404, apiT.registrationNotFound);
  }
  await prisma.registration.delete({ where: { id: registrationId } });
  return ok({ ok: true });
});
