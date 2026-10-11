import { getSessionUser } from "@/lib/auth";
import { handle, ok } from "@/lib/http";


export const GET = handle(async () => {
  const user = await getSessionUser();
  return ok({ user });
});
