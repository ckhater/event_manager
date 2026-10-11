import { NextRequest } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { apiT } from "@/lib/copy";

export const POST = handle(async (req: NextRequest) => {
  const json: unknown = await req.json();
  const { name, email, password } = signupSchema.parse(json);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, apiT.emailTaken);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "USER" },
    select: { id: true, email: true, name: true, role: true },
  });

  await createSession(user.id);
  return ok({ user }, { status: 201 });
});
