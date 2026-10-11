import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { HttpError } from "./http";
import { prisma } from "./prisma";
import { apiT } from "./copy";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours en secondes

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET manquant ou trop court (32+ caractères requis).",
    );
  }
  return new TextEncoder().encode(secret);
}

function cookieFlags(): {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

/** Crée le JWT de session (HS256, 7j) puis le pose en cookie httpOnly. */
export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, cookieFlags());
  return token;
}

/** Supprime le cookie de session. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function readUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * Session courante : vérifie le JWT puis RE-LIT l'utilisateur
 * (et son rôle) depuis la DB à chaque requête.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await readUserIdFromCookie();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

/** Exige un utilisateur connecté (401 sinon). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, apiT.unauthorized);
  return user;
}

/** Exige le rôle ADMIN (401 si anonyme, 403 si simple USER). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new HttpError(403, apiT.forbidden);
  return user;
}

// ---- Mots de passe (bcryptjs) ----

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Hash factice pour les timings quand l'e-mail n'existe pas (anti-énumération). */
export const DUMMY_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8a8h8p3i3a3a3a3a3a3a3a3a3a3a3a.";
