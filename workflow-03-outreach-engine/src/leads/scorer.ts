import { LeaseRecord } from '../crawler/re-daily-news';
import { FlyerProfile } from '../extractor/flyer';

export type MatchScore = 'hot' | 'warm' | 'cold';

export interface ScoredLead {
  record: LeaseRecord;
  score: MatchScore;
  reason: string;
  estimatedLeaseExpiry: Date;
  monthsUntilExpiry: number;
}

/**
 * Score a lease record against a listing profile.
 * Hot: lease expiring within 12 months AND size within 20%
 * Warm: lease within 3 years OR size within 40%
 * Cold: everything else
 */
export function scoreLead(record: LeaseRecord, profile: FlyerProfile): ScoredLead {
  // Estimate 5-year lease term (standard commercial)
  const leaseExpiry = new Date(record.leaseDate);
  leaseExpiry.setFullYear(leaseExpiry.getFullYear() + 5);
  const monthsUntilExpiry = monthsBetween(new Date(), leaseExpiry);

  const sizeMatch = record.sqft >= profile.matchSqftMin && record.sqft <= profile.matchSqftMax;
  const expiringWithin12Mo = monthsUntilExpiry <= 12;
  const expiringWithin36Mo = monthsUntilExpiry <= 36;
  const roughSizeMatch = Math.abs(record.sqft - profile.sqft) / profile.sqft <= 0.5;

  let score: MatchScore;
  let reason: string;

  if (expiringWithin12Mo && sizeMatch) {
    score = 'hot';
    reason = `Lease expiring in ~${monthsUntilExpiry} months, size matches perfectly`;
  } else if ((expiringWithin36Mo && sizeMatch) || (expiringWithin12Mo && roughSizeMatch)) {
    score = 'warm';
    reason = `Lease expiring in ~${monthsUntilExpiry} months, size is close`;
  } else {
    score = 'cold';
    reason = `Lease has ${monthsUntilExpiry} months left, size ${record.sqft.toLocaleString()} SF`;
  }

  return { record, score, reason, estimatedLeaseExpiry: leaseExpiry, monthsUntilExpiry };
}

function monthsBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}
