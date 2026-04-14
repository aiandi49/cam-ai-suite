import { Router, Request, Response } from 'express';
import { traceOwner } from '../tracer/pipeline';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /api/trace - start a trace
router.post('/', async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ success: false, error: 'Address required' });

    console.log(`[WF4] Starting trace for: ${address}`);
    const result = await traceOwner(address);

    // Save to owners table if we found something
    if (result.llcName || result.principals.length > 0) {
      await pool.query(
        `INSERT INTO owners (llc_name, parcel_number, principals, confidence_score, trace_status, traced_at)
         VALUES ($1, $2, $3, $4, 'found', NOW())`,
        [result.llcName, result.parcelNumber, JSON.stringify(result.principals), result.confidenceScore]
      );
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[WF4] Trace error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/trace/history - past traces
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM owners ORDER BY traced_at DESC LIMIT 20'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
