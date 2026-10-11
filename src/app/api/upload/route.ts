import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { handle, ok, HttpError } from "@/lib/http";
import { apiT } from "@/lib/copy";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// POST /api/upload — admin only. Accepts multipart { image: File },
// stores it on Vercel Blob and returns the public { url }.
export const POST = handle(async (req: NextRequest) => {
  await requireAdmin();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new HttpError(500, apiT.uploadNotConfigured);
  }

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    throw new HttpError(400, apiT.uploadMissing);
  }
  if (!ACCEPTED.includes(file.type)) {
    throw new HttpError(400, apiT.uploadInvalidType);
  }
  if (file.size > MAX_BYTES) {
    throw new HttpError(400, apiT.uploadTooLarge);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "cover";
  try {
    const blob = await put(`events/${crypto.randomUUID()}-${safeName}`, file, {
      access: "public",
      contentType: file.type,
    });
    return ok({ url: blob.url }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.toLowerCase().includes("private store")
    ) {
      throw new HttpError(500, apiT.uploadStorePrivate);
    }
    throw err;
  }
});
