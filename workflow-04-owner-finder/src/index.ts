import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import traceRoutes from './routes/trace';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ 
  status: 'ok', workflow: 'owner-finder',
  timestamp: new Date().toISOString()
}));

app.use('/api/trace', traceRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`[WF4] Owner Finder running on port ${PORT}`));
export default app;
