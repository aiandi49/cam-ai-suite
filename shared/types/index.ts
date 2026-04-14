// ============================================================
// KAM×AI SUITE — Shared TypeScript Types
// Used across all 5 workflows
// ============================================================

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  propertyType: 'retail' | 'office' | 'industrial' | 'mixed' | 'land';
  minSqft?: number;
  maxSqft?: number;
  maxMonthly?: number;
  transactionType: 'lease' | 'sale';
  maxSalePrice?: number;
  searchFrequency: 'daily' | 'weekly' | 'monthly';
  geoBounds?: GeoBounds;
  active: boolean;
  createdAt: Date;
}

export interface Property {
  id: string;
  externalId?: string;
  source: 'costar' | 'crexi' | 'loopnet' | 'mls' | 'parcel_db';
  address: string;
  city: string;
  state: string;
  zip?: string;
  lat?: number;
  lng?: number;
  propertyType: string;
  sqft?: number;
  lotSizeAcres?: number;
  yearBuilt?: number;
  askingMonthly?: number;
  askingSale?: number;
  availableDate?: Date;
  listingStatus: 'available' | 'proposed' | 'under_construction' | 'not_listed';
  isListed: boolean;
  sprinklered?: boolean;
  parkingRatio?: number;
  trafficCount?: number;
  crossStreet?: string;
  photos: string[];
  rawData?: Record<string, unknown>;
}

export interface SearchResult {
  clientId: string;
  searchedAt: Date;
  properties: Property[];
  newProperties: Property[];
  totalCount: number;
}

export interface Owner {
  id: string;
  propertyId: string;
  llcName?: string;
  parcelNumber?: string;
  principals: Principal[];
  confidenceScore: number;
  traceStatus: 'pending' | 'found' | 'failed';
  tracedAt?: Date;
}

export interface Principal {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  mailingAddress?: string;
}

export interface Lead {
  id: string;
  listingId: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  leaseAddress?: string;
  leaseSqft?: number;
  leaseDate?: Date;
  leaseSource?: string;
  matchScore: 'hot' | 'warm' | 'cold';
  matchReason?: string;
  emailDraft?: string;
  emailSent: boolean;
  responseStatus?: 'interested' | 'not_interested' | 'no_response' | 'follow_up';
}

export interface Campaign {
  id: string;
  listingId: string;
  name: string;
  status: 'draft' | 'sending' | 'sent' | 'complete';
  leadCount: number;
  sentCount: number;
  responseCount: number;
  createdAt: Date;
  launchedAt?: Date;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Report {
  id: string;
  clientId: string;
  title: string;
  parameters: SearchParameters;
  properties: Property[];
  pdfUrl?: string;
  generatedAt: Date;
  sentAt?: Date;
}

export interface SearchParameters {
  propertyType: string;
  minSqft?: number;
  maxSqft?: number;
  maxMonthly?: number;
  maxSalePrice?: number;
  transactionType: 'lease' | 'sale';
  geoBounds?: GeoBounds;
  sources: ('costar' | 'crexi' | 'loopnet')[];
  excludeStatuses?: string[];
}

export interface EmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  attachments?: Attachment[];
}

export interface SmsPayload {
  to: string;
  body: string;
}

export interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
