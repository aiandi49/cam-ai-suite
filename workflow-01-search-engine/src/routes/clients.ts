import { Router, Request, Response } from 'express';
import { getAllActiveClients, getClientById, createClient, updateClient, deactivateClient } from '../db/client';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const clients = await getAllActiveClients();
    res.json({ success: true, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const client = await getClientById(req.params.id);
    if (!client) return res.status(404).json({ success: false, error: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const client = await createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const client = await updateClient(req.params.id, req.body);
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deactivateClient(req.params.id);
    res.json({ success: true, message: 'Client deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
