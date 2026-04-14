import { Client, SearchParameters } from '../../../shared/types/index';
import { generateAiSummaries } from './ai-summaries';
import { generatePdf } from './pdf';
import { getGoogleMapsLink } from '../api/maps';

export interface ReportInput {
  client: Partial<Client>;
  params: SearchParameters;
  title?: string;
  properties?: any[];
}

export interface PropertyWithSummary {
  id?: string;
  address: string;
  propertyType?: string;
  sqft?: number;
  askingMonthly?: number;
  yearBuilt?: number;
  trafficCount?: number;
  parkingRatio?: number;
  sprinklered?: boolean;
  crossStreet?: string;
  photos?: string[];
  aiSummary?: string;
  mapsLink?: string;
  source?: string;
}

export interface GeneratedReport {
  title: string;
  client: Partial<Client>;
  params: SearchParameters;
  properties: PropertyWithSummary[];
  pdfBuffer: Buffer;
  generatedAt: Date;
}

export async function buildReport(input: ReportInput): Promise<GeneratedReport> {
  const properties: PropertyWithSummary[] = (input.properties || []).map(p => ({
    id: p.id,
    address: p.address,
    propertyType: p.property_type || p.propertyType,
    sqft: p.sqft,
    askingMonthly: p.asking_monthly || p.askingMonthly,
    yearBuilt: p.year_built || p.yearBuilt,
    trafficCount: p.traffic_count || p.trafficCount,
    parkingRatio: p.parking_ratio || p.parkingRatio,
    sprinklered: p.sprinklered,
    crossStreet: p.cross_street || p.crossStreet,
    photos: p.photos || [],
    source: p.source,
  }));

  // Add Google Maps links
  const withMaps = await Promise.all(
    properties.map(async (prop) => ({
      ...prop,
      mapsLink: await getGoogleMapsLink(prop.address + ', Tucson, AZ'),
    }))
  );

  // Add AI summaries
  const withSummaries = await generateAiSummaries(withMaps, input.params);

  const title = input.title || 
    `${input.params.propertyType} Space Report — ${input.client.name || 'Client'}`;

  const pdfBuffer = await generatePdf({ 
    title, 
    client: input.client, 
    properties: withSummaries 
  });

  return {
    title,
    client: input.client,
    params: input.params,
    properties: withSummaries,
    pdfBuffer,
    generatedAt: new Date(),
  };
}
