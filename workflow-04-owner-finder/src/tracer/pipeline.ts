import { lookupParcel } from '../gis/pima-maps';
import { searchCorporation } from '../corp/az-corp';
import { enrichContact } from '../social/enricher';
import { lookupAttom } from './attom';
import { scoreConfidence } from './scorer';
import { Owner, Principal } from '../../../shared/types/index';

export interface TraceResult {
  address: string;
  parcelNumber?: string;
  llcName?: string;
  principals: Principal[];
  owner?: Owner;
  confidenceScore: number;
  steps: TraceStep[];
}

export interface TraceStep {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  data?: Record<string, unknown>;
  error?: string;
}

export async function traceOwner(address: string): Promise<TraceResult> {
  const steps: TraceStep[] = [];
  let parcelNumber: string | undefined;
  let llcName: string | undefined;
  let principals: Principal[] = [];

  // ── STEP 1: Pima County GIS
  try {
    const parcel = await lookupParcel(address);
    parcelNumber = parcel.parcelNumber;
    llcName = parcel.ownerEntity;
    steps.push({ name: 'Pima County GIS', status: 'success', data: parcel });
  } catch (err) {
    steps.push({ name: 'Pima County GIS', status: 'failed', error: String(err) });
  }

  // ── STEP 2: AZ Corporation Commission
  if (llcName) {
    try {
      const corp = await searchCorporation(llcName);
      principals = corp.principals || [];
      steps.push({ name: 'AZ Corp Commission', status: 'success', data: corp });
    } catch (err) {
      steps.push({ name: 'AZ Corp Commission', status: 'failed', error: String(err) });
    }
  }

  // ── STEP 3: ATTOM cross-reference
  if (address) {
    try {
      const attom = await lookupAttom(address);
      steps.push({ name: 'ATTOM Data', status: 'success', data: attom });
    } catch (err) {
      steps.push({ name: 'ATTOM Data', status: 'skipped', error: String(err) });
    }
  }

  // ── STEP 4: Social / web enrichment per principal
  const enrichedPrincipals: Principal[] = [];
  for (const principal of principals) {
    try {
      const enriched = await enrichContact(principal.name, llcName);
      enrichedPrincipals.push({ ...principal, ...enriched });
    } catch {
      enrichedPrincipals.push(principal);
    }
  }

  const confidenceScore = scoreConfidence({ parcelNumber, llcName, principals: enrichedPrincipals });

  return {
    address,
    parcelNumber,
    llcName,
    principals: enrichedPrincipals,
    confidenceScore,
    steps,
  };
}
