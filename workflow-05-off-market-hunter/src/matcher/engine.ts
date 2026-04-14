import { GeoBounds } from '../../../shared/types/index';
import { getParcels, ParcelRecord } from '../parcels/pima-parcels';
import { isListedOnCostar } from '../utils/costar-check';
import { isListedOnCrexi } from '../utils/crexi-check';
import { scoreMatch, MatchResult } from './scorer';

export interface BuyerProfile {
  id?: string;
  name: string;
  propertyType: string;
  minSqft: number;
  maxSqft: number;
  minLotAcres?: number;
  maxSalePrice?: number;
  zoningCodes?: string[];
  geoBounds?: GeoBounds;
  radiusMiles?: number;
}

export interface HuntResult {
  buyerProfile: BuyerProfile;
  matches: MatchResult[];
  totalFound: number;
  highCount: number;
  medCount: number;
  lowCount: number;
  runnedAt: Date;
}

export async function runHunt(profile: BuyerProfile): Promise<HuntResult> {
  // 1. Get all parcels matching basic criteria from Pima County
  const parcels = await getParcels({
    minSqft: profile.minSqft,
    maxSqft: profile.maxSqft,
    minLotAcres: profile.minLotAcres,
    propertyType: profile.propertyType,
    geoBounds: profile.geoBounds,
  });

  // 2. Filter out already-listed properties (we want off-market only)
  const offMarket: ParcelRecord[] = [];
  for (const parcel of parcels) {
    const [onCostar, onCrexi] = await Promise.all([
      isListedOnCostar(parcel.address).catch(() => false),
      isListedOnCrexi(parcel.address).catch(() => false),
    ]);
    if (!onCostar && !onCrexi) offMarket.push(parcel);
  }

  // 3. Score each property
  const matches = offMarket
    .map(parcel => scoreMatch(parcel, profile))
    .filter(m => m.score >= parseInt(process.env.MIN_MATCH_SCORE || '20'))
    .sort((a, b) => b.numericScore - a.numericScore)
    .slice(0, parseInt(process.env.MAX_RESULTS_PER_HUNT || '200'));

  return {
    buyerProfile: profile,
    matches,
    totalFound: matches.length,
    highCount: matches.filter(m => m.score === 'high').length,
    medCount: matches.filter(m => m.score === 'medium').length,
    lowCount: matches.filter(m => m.score === 'low').length,
    runnedAt: new Date(),
  };
}
