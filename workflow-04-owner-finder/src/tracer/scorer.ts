import { Principal } from '../../../shared/types/index';

interface ScoreInput {
  parcelNumber?: string;
  llcName?: string;
  principals: Principal[];
}

/**
 * Calculate 0-100 confidence score for a completed trace.
 * Higher = more confident we've found the right person with real contact info.
 */
export function scoreConfidence(input: ScoreInput): number {
  let score = 0;

  // Parcel data found (30 pts)
  if (input.parcelNumber) score += 30;

  // Corp data found (30 pts)
  if (input.llcName) score += 15;
  if (input.principals.length > 0) score += 15;

  // Contact info found (40 pts)
  const hasPrincipalWithContact = input.principals.some(p => p.email || p.phone || p.linkedinUrl);
  if (hasPrincipalWithContact) {
    const p = input.principals.find(p => p.email || p.phone || p.linkedinUrl)!;
    if (p.email) score += 20;
    if (p.phone) score += 10;
    if (p.linkedinUrl) score += 10;
  }

  return Math.min(100, score);
}
