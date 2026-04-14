import axios from 'axios';

export interface CorpRecord {
  entityName: string;
  status: string;
  formedDate?: string;
  mailingAddress?: string;
  statutoryAgent?: string;
  principals: Array<{ name: string; role: string; address?: string }>;
}

/**
 * Search AZ Corporation Commission.
 * Uses their public search endpoint.
 * No API key needed - public government data.
 */
export async function searchCorporation(entityName: string): Promise<CorpRecord> {
  try {
    // AZ Corp Commission public search
    const response = await axios.post(
      'https://ecorp.azcc.gov/CommonHelper/GetSearchedBusinessList',
      {
        Name: entityName,
        SearchType: 'contains',
        EntityType: 'All',
        Status: 'All'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://ecorp.azcc.gov/BusinessSearch/BusinessSearch',
          'X-Requested-With': 'XMLHttpRequest',
        },
        timeout: 15000,
      }
    );

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const entity = response.data[0];
      
      // Get detailed record
      const detail = await getEntityDetail(entity.EntityId || entity.ID);
      
      return {
        entityName: entity.EntityName || entityName,
        status: entity.Status || 'Unknown',
        formedDate: entity.IncorporationDate || entity.FormationDate,
        mailingAddress: detail.mailingAddress,
        statutoryAgent: detail.statutoryAgent,
        principals: detail.principals,
      };
    }
  } catch (err) {
    console.log('[AZ Corp] Search attempt:', String(err).slice(0, 150));
  }

  // Return placeholder so pipeline doesn't crash
  return {
    entityName,
    status: 'Search at ecorp.azcc.gov',
    principals: [],
  };
}

async function getEntityDetail(entityId: string): Promise<{
  mailingAddress?: string;
  statutoryAgent?: string;
  principals: Array<{ name: string; role: string }>;
}> {
  try {
    const response = await axios.get(
      `https://ecorp.azcc.gov/BusinessSearch/GetBusinessById/${entityId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://ecorp.azcc.gov/BusinessSearch/BusinessSearch',
        },
        timeout: 10000,
      }
    );

    const data = response.data;
    return {
      mailingAddress: data.MailingAddress || data.PhysicalAddress,
      statutoryAgent: data.StatutoryAgent?.Name,
      principals: (data.Principals || data.Officers || []).map((p: any) => ({
        name: p.Name || p.FullName || '',
        role: p.Title || p.Role || 'Member',
        address: p.Address,
      })),
    };
  } catch {
    return { principals: [] };
  }
}
