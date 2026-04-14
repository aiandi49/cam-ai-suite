/**
 * Crexi API Client
 * Get API key: Crexi Pro → Settings → API Access
 * Base URL: https://api.crexi.com/v1
 */
import axios from 'axios';
import { SearchParameters, Property } from '../../../shared/types/index';

const client = axios.create({
  baseURL: process.env.CREXI_BASE_URL,
  headers: {
    'X-API-Key': process.env.CREXI_API_KEY,
    'Content-Type': 'application/json',
  },
});

export async function searchProperties(params: SearchParameters): Promise<Property[]> {
  // TODO: implement Crexi property search
  const response = await client.get('/listings', {
    params: {
      type: params.propertyType,
      sqft_min: params.minSqft,
      sqft_max: params.maxSqft,
      price_max: params.maxMonthly,
      transaction: params.transactionType,
      city: 'Tucson',
      state: 'AZ',
    },
  });
  return response.data.listings;
}
