import { Router, Request, Response } from 'express';
import { buildReport } from '../generator/report';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /api/reports - list all reports
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, client_id, title, generated_at, sent_at FROM reports ORDER BY generated_at DESC LIMIT 50'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/reports/generate - generate a new branded report
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { clientName, clientEmail, propertyType, minSqft, maxSqft, maxMonthly, title } = req.body;

    // For demo: use seeded properties from DB
    const propsResult = await pool.query(
      `SELECT * FROM properties 
       WHERE property_type = $1 
       AND ($2::int IS NULL OR sqft >= $2)
       AND ($3::int IS NULL OR sqft <= $3)
       AND ($4::numeric IS NULL OR asking_monthly <= $4)
       AND is_listed = true
       ORDER BY asking_monthly ASC LIMIT 10`,
      [propertyType || 'retail', minSqft || null, maxSqft || null, maxMonthly || null]
    );

    const client = { 
      id: 'demo', name: clientName || 'Demo Client', 
      email: clientEmail || 'demo@example.com',
      propertyType: propertyType || 'retail',
      minSqft, maxSqft, maxMonthly,
      transactionType: 'lease' as const,
      searchFrequency: 'daily' as const,
      active: true,
      createdAt: new Date()
    };

    const params = {
      propertyType: propertyType || 'retail',
      minSqft: minSqft || 2500,
      maxSqft: maxSqft || 3500,
      maxMonthly: maxMonthly || 3500,
      transactionType: 'lease' as const,
      sources: ['costar', 'crexi', 'loopnet'] as const
    };

    const report = await buildReport({ client, params, title, properties: propsResult.rows });

    // Save to DB
    await pool.query(
      'INSERT INTO reports (client_id, title, parameters, pdf_url, generated_at) VALUES ($1,$2,$3,$4,NOW())',
      ['demo', report.title, JSON.stringify(params), '/reports/latest.pdf']
    );

    // Return PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CAM-AI-Report-${Date.now()}.pdf"`,
    });
    res.send(report.pdfBuffer);

  } catch (err) {
    console.error('[WF2] Generate error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/reports/preview - get HTML preview
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { clientName, propertyType, minSqft, maxSqft, maxMonthly } = req.body;
    const propsResult = await pool.query(
      'SELECT * FROM properties WHERE is_listed = true ORDER BY asking_monthly ASC LIMIT 5'
    );
    res.json({ success: true, data: { properties: propsResult.rows, clientName, propertyType } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
