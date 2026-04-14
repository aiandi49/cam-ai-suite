import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ 
  status: 'ok', workflow: 'report-builder', 
  timestamp: new Date().toISOString() 
}));

app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[WF2] Report Builder running on port ${PORT}`));
export default app;
