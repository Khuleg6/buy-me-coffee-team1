import { del } from "@vercel/blob";

const VERCEL_BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

export function sanitizeBlobFilename(filename: string): string {
  const sanitized = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized || "image";
}

export async function deleteManagedBlob(url: string): Promise<void> {
  if (!url.startsWith("https://") && !url.startsWith("http://")) return;

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX)) return;

    await del(url);
  } catch (error) {
    console.warn("[blob delete] Failed to delete old image", error);
  }
}
