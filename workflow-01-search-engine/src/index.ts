import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients';
import searchRoutes from './routes/search';
import { startScheduler } from './scheduler/cron';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ 
  status: 'ok', 
  workflow: 'search-engine',
  timestamp: new Date().toISOString()
}));

app.use('/api/clients', clientRoutes);
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[WF1] Search Engine running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') startScheduler();
});

export default app;
