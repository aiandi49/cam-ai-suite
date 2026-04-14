import { ParcelRecord } from '../parcels/pima-parcels';
import { BuyerProfile } from './engine';

export type MatchLevel = 'high' | 'medium' | 'low';

export interface MatchResult {
  parcel: ParcelRecord;
  score: MatchLevel;
  numericScore: number;
  reasons: string[];
}

export function scoreMatch(parcel: ParcelRecord, profile: BuyerProfile): MatchResult {
  let points = 0;
  const reasons: string[] = [];

  // Square footage match (30 pts)
  if (parcel.buildingSqft) {
    const withinRange = parcel.buildingSqft >= profile.minSqft && parcel.buildingSqft <= profile.maxSqft;
    const close = Math.abs(parcel.buildingSqft - (profile.minSqft + profile.maxSqft) / 2)
      / ((profile.minSqft + profile.maxSqft) / 2) <= 0.3;

    if (withinRange) { points += 30; reasons.push(`Size ${parcel.buildingSqft.toLocaleString()} SF — perfect match`); }
    else if (close) { points += 15; reasons.push(`Size ${parcel.buildingSqft.toLocaleString()} SF — close match`); }
  }

  // Lot size match (20 pts)
  if (parcel.lotSizeAcres && profile.minLotAcres) {
    if (parcel.lotSizeAcres >= profile.minLotAcres) {
      points += 20;
      reasons.push(`Lot size ${parcel.lotSizeAcres} acres — meets requirement`);
    }
  }

  // Zoning compatibility (20 pts)
  if (profile.zoningCodes && parcel.zoning) {
    const compatible = profile.zoningCodes.some(z =>
      parcel.zoning.toUpperCase().includes(z.toUpperCase())
    );
    if (compatible) { points += 20; reasons.push(`Zoning ${parcel.zoning} — compatible`); }
  } else {
    points += 10; // No zoning filter specified — partial credit
  }

  // Value estimate within budget (15 pts)
  if (parcel.estimatedValue && profile.maxSalePrice) {
    if (parcel.estimatedValue <= profile.maxSalePrice) {
      points += 15;
      reasons.push(`Est. value $${parcel.estimatedValue.toLocaleString()} — within budget`);
    }
  }

  // Geography (15 pts) — assume passed if we got this far from getParcels filter
  points += 15;

  const score: MatchLevel = points >= 80 ? 'high' : points >= 50 ? 'medium' : 'low';

  return { parcel, score, numericScore: points, reasons };
}
