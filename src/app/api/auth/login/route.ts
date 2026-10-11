import { NextRequest } from "next/server";
import {
  createSession,
  verifyPassword,
  DUMMY_HASH,
} from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { apiT } from "@/lib/copy";

export const POST = handle(async (req: NextRequest) => {
  const json: unknown = await req.json();
  const { email, password } = loginSchema.parse(json);

  const user = await prisma.user.findUnique({ where: { email } });
  // Always compare a hash (real or dummy) to limit enumeration/timing attacks.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    // Small constant delay to smooth timing differences.
    await new Promise((r) => setTimeout(r, 350));
    // Deliberately generic: identical whether the email is
    // unknown or the password is wrong.
    throw new HttpError(401, apiT.loginInvalid);
  }

  await createSession(user.id);
  return ok({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});
