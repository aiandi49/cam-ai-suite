import { GeoBounds } from '../../../shared/types/index';

export interface ParcelRecord {
  parcelNumber: string;
  address: string;
  ownerEntity?: string;
  zoning: string;
  buildingSqft?: number;
  lotSizeAcres: number;
  yearBuilt?: number;
  estimatedValue?: number;
  lat?: number;
  lng?: number;
}

export interface ParcelFilter {
  minSqft?: number;
  maxSqft?: number;
  minLotAcres?: number;
  propertyType?: string;
  geoBounds?: GeoBounds;
  zoningCodes?: string[];
}

/**
 * Query Pima County parcel database.
 * Pima County provides bulk parcel data as a CSV download (public).
 * URL: https://www.assessor.pima.gov/Downloads/parcel_data.csv
 *
 * Strategy:
 * 1. Download parcel CSV nightly → import to local DB table
 * 2. Query local DB with filters (fast, no rate limits)
 * 3. Cross-reference with Pima Maps for additional details on matches
 */
export async function getParcels(filter: ParcelFilter): Promise<ParcelRecord[]> {
  // TODO: Query local parcels table (populated from CSV download)
  // For now, return empty — implement after DB import pipeline is set up

  // SQL query will look like:
  // SELECT * FROM parcels
  // WHERE building_sqft BETWEEN $1 AND $2
  // AND lot_size_acres >= $3
  // AND ST_Within(geom, ST_MakeEnvelope($4, $5, $6, $7, 4326))
  // AND zoning = ANY($8)

  return [];
}

/**
 * Download and import Pima County parcel CSV into local DB.
 * Run nightly via cron. CSV has ~400k records.
 */
export async function importParcelData(): Promise<void> {
  const csvUrl = process.env.PIMA_PARCEL_DATA_URL;
  if (!csvUrl) throw new Error('PIMA_PARCEL_DATA_URL not set');

  // TODO: Download CSV → parse → upsert into parcels table
  console.log('[Parcels] Starting parcel data import...');
}
