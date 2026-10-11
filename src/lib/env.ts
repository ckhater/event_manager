import { z } from "zod";

// Validated once at server boot (see src/instrumentation.ts).
// Missing/invalid values crash the process with a clear message
// instead of failing obscurely on the first request.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required."),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be 32+ characters."),
  SEED_ADMIN_EMAIL: z.string().email("SEED_ADMIN_EMAIL must be a valid email."),
  SEED_ADMIN_PASSWORD: z
    .string()
    .min(8, "SEED_ADMIN_PASSWORD must be 8+ characters."),
});

function load(): z.infer<typeof envSchema> {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `- ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration, refusing to boot:\n${details}\nCheck .env (local) or Project Settings → Environment Variables (Vercel).`,
    );
  }
  return parsed.data;
}

export const env = load();
