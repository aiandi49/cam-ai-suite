// Mirrors WF1 costar.ts — shared logic, kept separate for independent deployment
import axios from 'axios';
import { SearchParameters, Property } from '../../../shared/types/index';

const client = axios.create({
  baseURL: process.env.COSTAR_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.COSTAR_API_KEY}`,
    'X-API-Secret': process.env.COSTAR_API_SECRET,
  },
});

export async function searchProperties(params: SearchParameters): Promise<Property[]> {
  // TODO: implement CoStar search
  const response = await client.post('/properties/search', { ...params });
  return response.data.properties;
}
