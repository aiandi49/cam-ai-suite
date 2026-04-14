/**
 * LoopNet API Client
 * Same CoStar Group account — request access from your rep
 * Base URL: https://api.loopnet.com/v1
 */
import axios from 'axios';
import { SearchParameters, Property } from '../../../shared/types/index';

const client = axios.create({
  baseURL: process.env.LOOPNET_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.LOOPNET_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function searchProperties(params: SearchParameters): Promise<Property[]> {
  // TODO: implement LoopNet property search
  const response = await client.get('/for-lease', {
    params: {
      propertyType: params.propertyType,
      minSize: params.minSqft,
      maxSize: params.maxSqft,
      maxRate: params.maxMonthly,
      location: 'Tucson, AZ',
    },
  });
  return response.data.results;
}
