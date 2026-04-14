import axios from 'axios';

export interface AttomRecord {
  ownerName?: string;
  ownerMailingAddress?: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
  assessedValue?: number;
  taxAmount?: number;
}

/**
 * ATTOM Data API — property ownership + transaction history
 * Docs: https://api.attomdata.com/swagger/index.html
 */
export async function lookupAttom(address: string): Promise<AttomRecord> {
  const client = axios.create({
    baseURL: process.env.ATTOM_BASE_URL,
    headers: {
      'apikey': process.env.ATTOM_API_KEY,
      'Accept': 'application/json',
    },
  });

  // ATTOM uses a two-field address format: address1 (street) + address2 (city/state/zip)
  const parts = address.split(',');
  const street = parts[0]?.trim();
  const cityState = parts.slice(1).join(',').trim() || 'Tucson, AZ';

  const response = await client.get('/propertyapi/v1.0.0/property/basicprofile', {
    params: { address1: street, address2: cityState },
  });

  const prop = response.data?.property?.[0];
  if (!prop) return {};

  return {
    ownerName: prop.assessment?.owner?.owner1?.fullname,
    ownerMailingAddress: prop.assessment?.owner?.mailingaddressoneline,
    lastSaleDate: prop.sale?.salehistory?.[0]?.salesearchdate,
    lastSalePrice: prop.sale?.salehistory?.[0]?.amount?.saleamt,
    assessedValue: prop.assessment?.assessed?.assdttlvalue,
    taxAmount: prop.assessment?.tax?.taxamt,
  };
}
