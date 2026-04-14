/**
 * CoStar API Client
 * Docs: Contact your CoStar rep for API documentation
 * Base URL: https://api.costar.com/v1
 */
import axios from 'axios';
import { SearchParameters, Property } from '../../../shared/types/index';

const client = axios.create({
  baseURL: process.env.COSTAR_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.COSTAR_API_KEY}`,
    'X-API-Secret': process.env.COSTAR_API_SECRET,
    'Content-Type': 'application/json',
  },
});

export async function searchProperties(params: SearchParameters): Promise<Property[]> {
  // TODO: implement CoStar property search
  // Reference CoStar API docs for exact endpoint + payload structure
  const response = await client.post('/properties/search', {
    propertyType: params.propertyType,
    minSqFt: params.minSqft,
    maxSqFt: params.maxSqft,
    maxMonthlyRate: params.maxMonthly,
    transactionType: params.transactionType,
    market: process.env.DEFAULT_MARKET || 'Tucson, AZ',
    geoBounds: params.geoBounds,
    listingStatus: ['available'],
  });
  return response.data.properties;
}

export async function getPropertyById(id: string): Promise<Property> {
  const response = await client.get(`/properties/${id}`);
  return response.data;
}
