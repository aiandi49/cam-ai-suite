import { Router, Request, Response } from 'express';
import { extractFlyerProfile } from '../extractor/flyer';
import { Pool } from 'pg';
import multer from 'multer';
import path from 'path';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const upload = multer({ dest: process.env.UPLOAD_DIR || './assets/flyers' });

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 20');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/upload-flyer', upload.single('flyer'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const mimeType = req.file.mimetype as 'image/jpeg' | 'image/png';
    const profile = await extractFlyerProfile(req.file.path, mimeType);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/leads', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
