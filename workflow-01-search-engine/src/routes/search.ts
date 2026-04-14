import { Router, Request, Response } from 'express';
import { getClientById } from '../db/client';
import { runAllClientSearches } from '../scheduler/runner';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/run-all', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Search job started' });
    runAllClientSearches().catch(console.error);
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/run/:clientId', async (req: Request, res: Response) => {
  try {
    const client = await getClientById(req.params.clientId);
    if (!client) return res.status(404).json({ success: false, error: 'Client not found' });
    res.json({ success: true, message: `Search started for ${client.name}` });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/properties', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM properties WHERE is_listed = true ORDER BY created_at DESC LIMIT 50'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/history/:clientId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM client_searches WHERE client_id = $1 ORDER BY searched_at DESC LIMIT 20',
      [req.params.clientId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
