import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { apiT } from "./copy";

export type FieldErrors = Record<string, string[]>;

/** Erreur HTTP typée portée par les route handlers. */
export class HttpError extends Error {
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Corps d'erreur JSON uniforme : { error, fieldErrors? }. */
export function errorBody(message: string, fieldErrors?: FieldErrors): {
  error: string;
  fieldErrors?: FieldErrors;
} {
  return fieldErrors ? { error: message, fieldErrors } : { error: message };
}

type Handler<TParams extends Record<string, string> = Record<string, string>> = (
  req: NextRequest,
  // Contexte Next 15/16 : params est une Promise.
  ctx: { params: Promise<TParams> },
) => Promise<NextResponse>;

/**
 * Wrapper des route handlers : attrape HttpError / ZodError
 * et renvoie toujours du JSON { error, fieldErrors? }.
 */
export function handle<TParams extends Record<string, string> = Record<string, string>>(
  fn: Handler<TParams>,
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<TParams> },
  ): Promise<NextResponse> => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json(errorBody(err.message, err.fieldErrors), {
          status: err.status,
        });
      }
      if (err instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        for (const issue of err.issues) {
          const key = issue.path.join(".") || "_";
          const list = fieldErrors[key] ?? [];
          list.push(issue.message);
          fieldErrors[key] = list;
        }
        return NextResponse.json(errorBody(apiT.invalidData, fieldErrors), {
          status: 400,
        });
      }
      console.error("[api]", err);
      return NextResponse.json(errorBody(apiT.internal), {
        status: 500,
      });
    }
  };
}

/** Raccourci JSON 200. */
export function ok<T>(data: T, init?: { status?: number }): NextResponse {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}
