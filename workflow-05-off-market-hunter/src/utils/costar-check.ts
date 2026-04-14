import axios from 'axios';

const client = axios.create({
  baseURL: process.env.COSTAR_BASE_URL,
  headers: { 'Authorization': `Bearer ${process.env.COSTAR_API_KEY}` },
});

/**
 * Check if a property address is currently listed on CoStar.
 * Used to filter out already-listed properties from off-market results.
 */
export async function isListedOnCostar(address: string): Promise<boolean> {
  try {
    const response = await client.get('/properties/lookup', {
      params: { address, listingStatus: 'available' },
    });
    return response.data.count > 0;
  } catch {
    return false; // If check fails, assume not listed (don't miss off-market)
  }
}
