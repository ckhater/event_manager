"use client";

/**
 * Petit wrapper fetch pour tous les appels API.
 * En cas d'erreur HTTP, lève { message, fieldErrors, status }.
 */

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toApiError(status: number, body: unknown): ApiError {
  if (isRecord(body) && typeof body.error === "string") {
    const fieldErrors =
      isRecord(body.fieldErrors) &&
      Object.values(body.fieldErrors).every(Array.isArray)
        ? (body.fieldErrors as Record<string, string[]>)
        : undefined;
    return { message: body.error, fieldErrors, status };
  }
  return { message: "Une erreur est survenue.", status };
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(input, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const text = await res.text();
  const body: unknown = text ? safeJson(text) : null;
  if (!res.ok) throw toApiError(res.status, body);
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
