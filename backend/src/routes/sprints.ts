import { Router } from 'express';
import db from '../database/db';

const router = Router();

// GET all sprints
router.get('/', (req, res) => {
  const projectId = req.query.projectId;
  let query = 'SELECT * FROM sprints';
  const params: any[] = [];
  if (projectId) {
    query += ' WHERE projectId = ?';
    params.push(projectId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single sprint
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM sprints WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Sprint not found' });
    res.json(row);
  });
});

// CREATE sprint
router.post('/', (req, res) => {
  const { projectId, name, goal, startDate, endDate, status } = req.body;
  if (!projectId || !name) return res.status(400).json({ error: 'Project ID and Name are required' });

  const query = `INSERT INTO sprints (projectId, name, goal, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [projectId, name, goal, startDate, endDate, status || 'Planned'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, ...req.body, status: status || 'Planned' });
  });
});

// UPDATE sprint
router.put('/:id', (req, res) => {
  const { name, goal, startDate, endDate, status } = req.body;
  const query = `UPDATE sprints SET name = COALESCE(?, name), goal = COALESCE(?, goal), startDate = COALESCE(?, startDate), endDate = COALESCE(?, endDate), status = COALESCE(?, status) WHERE id = ?`;
  db.run(query, [name, goal, startDate, endDate, status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sprint updated', changes: this.changes });
  });
});

// DELETE sprint
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM sprints WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sprint deleted', changes: this.changes });
  });
});

export default router;
