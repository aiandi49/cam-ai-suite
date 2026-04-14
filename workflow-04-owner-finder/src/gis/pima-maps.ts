import axios from 'axios';

export interface ParcelRecord {
  parcelNumber: string;
  address: string;
  ownerEntity: string;
  zoning: string;
  lotSizeAcres: number;
  buildingSqft?: number;
  assessedValue?: number;
  mailingAddress?: string;
}

/**
 * Lookup parcel from Pima County Assessor public API.
 * Uses the public REST endpoint - no auth needed.
 * Address quirks: spell out North/South/East/West, no abbreviations.
 */
export async function lookupParcel(address: string): Promise<ParcelRecord> {
  const normalized = normalizeForPimaSearch(address);
  
  try {
    // Pima County has a public ArcGIS REST endpoint
    const searchUrl = 'https://webcms.pima.gov/UserFiles/Servers/Server_6/File/Government/Assessor/Parcel%20Search/';
    
    // Try the Pima County public property search API
    const response = await axios.get(
      'https://www.assessor.pima.gov/parcel/search',
      {
        params: { address: normalized, format: 'json' },
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
      }
    );

    if (response.data && response.data.parcel) {
      const p = response.data.parcel;
      return {
        parcelNumber: p.parcel_number || p.apn || '',
        address: p.site_address || normalized,
        ownerEntity: p.owner_name || p.owner || '',
        zoning: p.zoning || '',
        lotSizeAcres: parseFloat(p.lot_size_acres || '0'),
        buildingSqft: parseInt(p.building_sqft || '0'),
        assessedValue: parseInt(p.assessed_value || '0'),
        mailingAddress: p.mailing_address || '',
      };
    }
  } catch (err) {
    console.log('[Pima] Primary API failed, trying fallback...', String(err).slice(0, 100));
  }

  // Fallback: return normalized data so pipeline continues
  return {
    parcelNumber: 'LOOKUP-REQUIRED',
    address: normalized,
    ownerEntity: 'Manual lookup required at assessor.pima.gov',
    zoning: 'N/A',
    lotSizeAcres: 0,
  };
}

export function normalizeForPimaSearch(address: string): string {
  return address
    .replace(/\bN\.?\s/gi, 'North ')
    .replace(/\bS\.?\s/gi, 'South ')
    .replace(/\bE\.?\s/gi, 'East ')
    .replace(/\bW\.?\s/gi, 'West ')
    .replace(/\bSt\.?\b/gi, 'Street')
    .replace(/\bAve\.?\b/gi, 'Avenue')
    .replace(/\bBlvd\.?\b/gi, 'Boulevard')
    .replace(/\bDr\.?\b/gi, 'Drive')
    .replace(/\bRd\.?\b/gi, 'Road')
    .replace(/\bLn\.?\b/gi, 'Lane')
    .replace(/[#,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
