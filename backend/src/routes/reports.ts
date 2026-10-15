import { Router } from 'express';
import db from '../database/db';

const router = Router();

router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => err ? reject(err) : resolve(row));
    });

    const sprints = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM sprints WHERE projectId = ?', [projectId], (err, rows) => err ? reject(err) : resolve(rows));
    });

    const tasks = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE projectId = ?', [projectId], (err, rows) => err ? reject(err) : resolve(rows));
    });

    const risks = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM risks WHERE projectId = ?', [projectId], (err, rows) => err ? reject(err) : resolve(rows));
    });

    res.json({
      project,
      sprints,
      tasks,
      risks
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
