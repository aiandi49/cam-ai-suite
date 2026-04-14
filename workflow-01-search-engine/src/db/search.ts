import { Pool } from 'pg';
import { Property } from '../../../shared/types/index';
import { diffPropertyLists } from '../utils/diff';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function diffProperties(
  clientId: string,
  currentProperties: Property[]
): Promise<{ newProperties: Property[]; removedProperties: Property[] }> {
  // Get last search snapshot
  const res = await pool.query(
    `SELECT cs.property_ids FROM client_searches cs
     WHERE cs.client_id = $1
     ORDER BY cs.searched_at DESC LIMIT 1`,
    [clientId]
  );

  if (!res.rows[0]) {
    // First search — everything is "new"
    return { newProperties: currentProperties, removedProperties: [] };
  }

  const prevIds: string[] = res.rows[0].property_ids || [];
  const prevProps = await getPropertiesByIds(prevIds);

  return diffPropertyLists(prevProps, currentProperties);
}

export async function saveSearchSnapshot(
  clientId: string,
  properties: Property[],
  newProperties: Property[]
): Promise<void> {
  // Upsert properties
  for (const prop of properties) {
    await pool.query(
      `INSERT INTO properties (external_id, source, address, property_type, sqft,
       asking_monthly, asking_sale, photos, raw_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (external_id, source) DO UPDATE
       SET asking_monthly=$6, updated_at=NOW()`,
      [prop.externalId, prop.source, prop.address, prop.propertyType,
       prop.sqft, prop.askingMonthly, prop.askingSale,
       JSON.stringify(prop.photos), JSON.stringify(prop.rawData)]
    );
  }

  // Save snapshot
  const propIds = properties.map(p => p.id).filter(Boolean);
  const newIds = newProperties.map(p => p.id).filter(Boolean);

  await pool.query(
    `INSERT INTO client_searches (client_id, property_ids, new_property_ids, total_count)
     VALUES ($1, $2, $3, $4)`,
    [clientId, propIds, newIds, properties.length]
  );
}

async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];
  const res = await pool.query(
    'SELECT * FROM properties WHERE id = ANY($1)',
    [ids]
  );
  return res.rows as Property[];
}
