import { z } from "zod";
import { validationMessages as m } from "./copy";

export const signupSchema = z.object({
  name: z.string({ error: m.nameMin }).trim().min(2, m.nameMin).max(80, m.nameMax),
  email: z
    .string({ error: m.emailInvalid })
    .trim()
    .toLowerCase()
    .email(m.emailInvalid)
    .max(255, m.emailMax),
  password: z
    .string({ error: m.passwordMin })
    .min(8, m.passwordMin)
    .max(128, m.passwordMax),
});

export const loginSchema = z.object({
  email: z
    .string({ error: m.emailInvalid })
    .trim()
    .toLowerCase()
    .email(m.emailInvalid),
  password: z.string({ error: m.passwordRequired }).min(1, m.passwordRequired),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ---- Events ----

const dateSchema = z.coerce
  .date({ error: m.dateInvalid })
  .refine((d) => !Number.isNaN(d.getTime()), { error: m.dateInvalid });

export const eventSchema = z
  .object({
    title: z
      .string({ error: m.titleMin })
      .trim()
      .min(3, m.titleMin)
      .max(120, m.titleMax),
    description: z
      .string({ error: m.descMin })
      .trim()
      .min(10, m.descMin)
      .max(5000, m.descMax),
    // <input type="datetime-local"> sends "YYYY-MM-DDTHH:mm" (local time);
    // z.coerce.date() parses it. ISO strings accepted too.
    startDate: dateSchema,
    endDate: dateSchema,
    location: z
      .string({ error: m.locationMin })
      .trim()
      .min(2, m.locationMin)
      .max(160, m.locationMax),
    imageUrl: z
      .string()
      .trim()
      .max(2000, m.imageUrlBad)
      .optional()
      .default("")
      .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
        error: m.imageUrlBad,
      })
      .transform((v) => (v === "" ? null : v)),
    capacity: z
      .number({ error: m.capacityNumber })
      .int(m.capacityInt)
      .min(1, m.capacityMin)
      .max(100_000, m.capacityMax),
  })
  .refine((v) => v.endDate.getTime() >= v.startDate.getTime(), {
    error: m.dateRange,
    path: ["endDate"],
  });

export type EventInput = z.infer<typeof eventSchema>;

// ---- Registrations ----

export const registrationSchema = z.object({
  name: z.string({ error: m.nameMin }).trim().min(2, m.nameMin).max(80, m.nameMax),
  email: z
    .string({ error: m.emailInvalid })
    .trim()
    .toLowerCase()
    .email(m.emailInvalid)
    .max(255, m.emailMax),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

// ---- Querystring GET /api/events ----

const ymd = /^\d{4}-\d{2}-\d{2}$/;

export const eventsQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(160).optional().default(""),
  from: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || ymd.test(v), { error: m.fromBad }),
  to: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => v === "" || ymd.test(v), { error: m.toBad }),
  status: z.enum(["all", "upcoming", "past"]).optional().default("upcoming"),
  available: z
    .enum(["true", "false", ""])
    .optional()
    .default("")
    .transform((v) => v === "true"),
  sort: z.enum(["date_asc", "date_desc"]).optional().default("date_asc"),
});

export type EventsQuery = z.infer<typeof eventsQuerySchema>;
