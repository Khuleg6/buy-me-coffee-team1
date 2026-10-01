import { del } from "@vercel/blob";

const VERCEL_BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";
const PROFILE_IMAGE_ENDPOINT = "/api/profile/image";

export function sanitizeBlobFilename(filename: string): string {
  const sanitized = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized || "image";
}

export function profileImageUrl(pathname: string): string {
  return `${PROFILE_IMAGE_ENDPOINT}?path=${encodeURIComponent(pathname)}`;
}

export function profileImagePath(url: string): string | null {
  if (!url.startsWith(`${PROFILE_IMAGE_ENDPOINT}?`)) return null;

  const pathname = new URL(url, "http://localhost").searchParams.get("path");
  return pathname?.startsWith("avatars/") || pathname?.startsWith("covers/")
    ? pathname
    : null;
}

export async function deleteManagedBlob(url: string): Promise<void> {
  const privatePath = profileImagePath(url);
  if (privatePath) {
    try {
      await del(privatePath);
    } catch (error) {
      console.warn("[blob delete] Failed to delete old image", error);
    }
    return;
  }

  if (!url.startsWith("https://") && !url.startsWith("http://")) return;

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX)) return;

    await del(url);
  } catch (error) {
    console.warn("[blob delete] Failed to delete old image", error);
  }
}
