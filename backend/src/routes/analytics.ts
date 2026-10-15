import { Router } from 'express';
import db from '../database/db';

const router = Router();

// GET analytics for a specific project
router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const getTasksCount = () => new Promise<any>((resolve, reject) => {
      db.get(`SELECT
        COUNT(id) as total,
        SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed
      FROM tasks WHERE projectId = ?`, [projectId], (err, row) => err ? reject(err) : resolve(row));
    });

    const getTasksByStatus = () => new Promise<any[]>((resolve, reject) => {
      db.all('SELECT status, COUNT(*) as count FROM tasks WHERE projectId = ? GROUP BY status', [projectId], (err, rows) => err ? reject(err) : resolve(rows));
    });

    const getRisksSummary = () => new Promise<any>((resolve, reject) => {
      db.get(`SELECT
        COUNT(id) as total,
        SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN status != 'Closed' THEN 1 ELSE 0 END) as open
      FROM risks WHERE projectId = ?`, [projectId], (err, row) => err ? reject(err) : resolve(row));
    });

    const getRisksBySeverity = () => new Promise<any[]>((resolve, reject) => {
      db.all('SELECT severity, COUNT(*) as count FROM risks WHERE projectId = ? GROUP BY severity', [projectId], (err, rows) => err ? reject(err) : resolve(rows));
    });

    const tasksCount = await getTasksCount();
    const tasksByStatus = await getTasksByStatus();
    const risksSummary = await getRisksSummary();
    const risksBySeverity = await getRisksBySeverity();

    res.json({
      tasks: tasksCount,
      tasksByStatus,
      risks: risksSummary,
      risksBySeverity
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET global dashboard analytics
router.get('/', async (req, res) => {
  try {
    const getGlobalStats = () => new Promise<any>((resolve, reject) => {
      db.get(`
        SELECT
          (SELECT COUNT(*) FROM projects) as totalProjects,
          (SELECT COUNT(*) FROM sprints WHERE status = 'Active') as activeSprints,
          (SELECT COUNT(*) FROM tasks) as totalTasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'DONE') as completedTasks,
          (SELECT COUNT(*) FROM risks WHERE status != 'Closed') as openRisks,
          (SELECT COUNT(*) FROM risks WHERE severity = 'CRITICAL') as criticalRisks
      `, [], (err, row) => err ? reject(err) : resolve(row));
    });

    const stats = await getGlobalStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
