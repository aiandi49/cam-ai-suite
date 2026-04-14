import { Pool } from 'pg';
import { Client } from '../../../shared/types/index';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getAllActiveClients(): Promise<Client[]> {
  const res = await pool.query(
    `SELECT * FROM clients WHERE active = true ORDER BY name`
  );
  return res.rows.map(rowToClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  const res = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
  return res.rows[0] ? rowToClient(res.rows[0]) : null;
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  const res = await pool.query(
    `INSERT INTO clients (name, email, phone, property_type, min_sqft, max_sqft,
     max_monthly, transaction_type, search_frequency, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING *`,
    [data.name, data.email, data.phone, data.propertyType,
     data.minSqft, data.maxSqft, data.maxMonthly,
     data.transactionType, data.searchFrequency || 'daily']
  );
  return rowToClient(res.rows[0]);
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  const res = await pool.query(
    `UPDATE clients SET name=$1, email=$2, phone=$3, property_type=$4,
     min_sqft=$5, max_sqft=$6, max_monthly=$7, search_frequency=$8, updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [data.name, data.email, data.phone, data.propertyType,
     data.minSqft, data.maxSqft, data.maxMonthly,
     data.searchFrequency, id]
  );
  return rowToClient(res.rows[0]);
}

export async function deactivateClient(id: string): Promise<void> {
  await pool.query('UPDATE clients SET active=false WHERE id=$1', [id]);
}

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    company: row.company as string,
    propertyType: row.property_type as Client['propertyType'],
    minSqft: row.min_sqft as number,
    maxSqft: row.max_sqft as number,
    maxMonthly: row.max_monthly as number,
    transactionType: row.transaction_type as 'lease' | 'sale',
    maxSalePrice: row.max_sale_price as number,
    searchFrequency: row.search_frequency as Client['searchFrequency'],
    geoBounds: row.geo_bounds as Client['geoBounds'],
    active: row.active as boolean,
    createdAt: row.created_at as Date,
  };
}
