/**
 * Helpers for listing create/edit photo handling
 */

import { uploadImages, toPickedImage, type PickedImage } from '../services/uploadService';

const isRemoteUri = (uri: string) => /^https?:\/\//i.test(uri);

/**
 * Resolve a listing id from API/nav payloads (handles nested shapes).
 */
export function resolveListingId(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.id === 'string' && obj.id.trim()) return obj.id.trim();
  if (typeof obj._id === 'string' && obj._id.trim()) return obj._id.trim();
  if (obj.data && typeof obj.data === 'object') {
    return resolveListingId(obj.data);
  }
  return null;
}

/**
 * Keep already-uploaded http(s) URLs; upload only local/content URIs.
 * Accepts plain URI strings or full PickedImage objects (preferred — keeps mime/type).
 */
export async function resolveListingPhotoUrls(
  items: Array<string | PickedImage>,
  folder: string = 'listings/',
): Promise<string[]> {
  const photos = items.map(toPickedImage).filter((p) => !!p.uri);
  const remote = photos.filter((p) => isRemoteUri(p.uri));
  const local = photos.filter((p) => !isRemoteUri(p.uri));

  if (local.length === 0) {
    return remote.map((p) => p.uri);
  }

  const uploaded = await uploadImages(local, folder);
  return [...remote.map((p) => p.uri), ...uploaded.map((img) => img.url)];
}

/**
 * Deduplicate listings by id (keeps first occurrence).
 */
export function dedupeListingsById<T extends { id?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const id = item?.id != null ? String(item.id) : '';
    if (!id) {
      result.push(item);
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }
  return result;
}
