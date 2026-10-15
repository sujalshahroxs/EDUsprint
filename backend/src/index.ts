import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import projectRoutes from './routes/projects';
import sprintRoutes from './routes/sprints';
import taskRoutes from './routes/tasks';
import riskRoutes from './routes/risks';
import analyticsRoutes from './routes/analytics';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);




import { runSeed } from './database/seed';
import db from './database/db';

app.post('/api/seed', async (req, res) => {
  try {
    await runSeed();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-seed if empty
db.get('SELECT COUNT(*) as count FROM projects', (err, row: any) => {
  if (!err && row && row.count === 0) {
    console.log('Database empty, running seed...');
    runSeed().catch(console.error);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// React Router fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
