/**
 * Canonical property amenity ids (comma-separated on listing.amenities).
 * Legacy free-text values parse as kind "legacy" for display without icons.
 */

export const PROPERTY_AMENITIES = [
  { id: '24_7_security', label: '24/7 security' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'broadband_internet', label: 'Broadband internet' },
  { id: 'built_in_kitchen', label: 'Built-in kitchen' },
  { id: 'built_in_wardrobe', label: 'Built-in wardrobe' },
  { id: 'central_ac_and_heating', label: 'Central AC and heating' },
  { id: 'concierge', label: 'Concierge' },
  { id: 'double_glazed_window', label: 'Double-glazed windows' },
  { id: 'EPC_rating', label: 'EPC rating' },
  { id: 'green_spaces', label: 'Green spaces' },
  { id: 'intercom', label: 'Intercom' },
  { id: 'parking', label: 'Parking' },
  { id: 'pets_allowed', label: 'Pets allowed' },
  { id: 'private_garden', label: 'Private garden' },
  { id: 'private_gym', label: 'Private gym' },
  { id: 'private_pool', label: 'Private pool' },
  { id: 'road_parking', label: 'Road parking' },
  { id: 'shared_bathroom', label: 'Shared bathroom' },
  { id: 'shared_garden', label: 'Shared garden' },
  { id: 'shared_gym', label: 'Shared gym' },
  { id: 'shared_kitchen', label: 'Shared kitchen' },
  { id: 'shared_pool', label: 'Shared pool' },
  { id: 'storage_area', label: 'Storage area' },
  { id: 'transport_hub', label: 'Near transport hub' },
] as const;

export type PropertyAmenityId = (typeof PROPERTY_AMENITIES)[number]['id'];

const KNOWN_IDS = new Set<string>(PROPERTY_AMENITIES.map((a) => a.id));

const LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  PROPERTY_AMENITIES.map((a) => [a.id, a.label]),
);

export type ParsedAmenityToken =
  | { kind: 'known'; id: PropertyAmenityId; label: string }
  | { kind: 'legacy'; label: string };

export function parseStoredAmenities(raw?: string | null): ParsedAmenityToken[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      if (KNOWN_IDS.has(token) && LABEL_BY_ID[token]) {
        return { kind: 'known', id: token as PropertyAmenityId, label: LABEL_BY_ID[token] };
      }
      return { kind: 'legacy', label: token };
    });
}

export function serializeAmenityIds(ids: readonly string[]): string {
  return [...new Set(ids.filter(Boolean))].join(',');
}
