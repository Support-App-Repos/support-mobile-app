/**
 * Unwrap nested API payloads: { success, data } from axios + backend.
 * Avoids treating the wrapper object as the entity when data is null.
 */
export function unwrapApiPayload<T>(response: { data?: unknown } | undefined): T | null {
  const payload = response?.data;
  if (payload == null) return null;

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    'data' in payload
  ) {
    const nested = (payload as { data?: T | null }).data;
    return nested ?? null;
  }

  return payload as T;
}
