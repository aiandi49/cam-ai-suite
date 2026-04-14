import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyType, minSqft, maxSqft, maxSalePrice } = req.body;
    // Query unlisted properties from our DB
    const result = await pool.query(
      `SELECT * FROM properties WHERE is_listed = false OR source = 'parcel_db'
       AND ($1::varchar IS NULL OR property_type = $1)
       ORDER BY created_at DESC LIMIT 50`,
      [propertyType || null]
    );
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/buyers', async (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

export default router;
