import axios from 'axios';

const client = axios.create({
  baseURL: process.env.CREXI_BASE_URL,
  headers: { 'X-API-Key': process.env.CREXI_API_KEY },
});

export async function isListedOnCrexi(address: string): Promise<boolean> {
  try {
    const response = await client.get('/listings/lookup', {
      params: { address },
    });
    return response.data.total > 0;
  } catch {
    return false;
  }
}
