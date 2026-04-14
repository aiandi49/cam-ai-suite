import { Property } from '../../../shared/types/index';

/**
 * Remove duplicate properties across CoStar, Crexi, LoopNet results.
 * Dedup strategy: normalize address, match by street number + street name.
 */
export function deduplicateProperties(properties: Property[]): Property[] {
  const seen = new Map<string, Property>();

  for (const prop of properties) {
    const key = normalizeAddress(prop.address);
    if (!seen.has(key)) {
      seen.set(key, prop);
    } else {
      // Keep the one with more data (more photos, more fields filled)
      const existing = seen.get(key)!;
      if (dataScore(prop) > dataScore(existing)) {
        seen.set(key, prop);
      }
    }
  }

  return Array.from(seen.values());
}

function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/\b(north|south|east|west|n\.|s\.|e\.|w\.)\b/g, '')
    .replace(/\b(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function dataScore(p: Property): number {
  let score = 0;
  if (p.photos?.length) score += p.photos.length;
  if (p.trafficCount) score += 1;
  if (p.parkingRatio) score += 1;
  if (p.crossStreet) score += 1;
  if (p.sqft) score += 1;
  return score;
}
