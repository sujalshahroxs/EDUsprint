import { Router } from 'express';
import db from '../database/db';

const router = Router();

// GET all projects
router.get('/', (req, res) => {
  db.all('SELECT * FROM projects', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single project
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Project not found' });
    res.json(row);
  });
});

// CREATE project
router.post('/', (req, res) => {
  const { name, description, startDate, endDate, status, manager } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const query = `INSERT INTO projects (name, description, startDate, endDate, status, manager) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [name, description, startDate, endDate, status || 'Planning', manager], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, ...req.body, status: status || 'Planning' });
  });
});

// UPDATE project
router.put('/:id', (req, res) => {
  const { name, description, startDate, endDate, status, manager } = req.body;
  const query = `UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), startDate = COALESCE(?, startDate), endDate = COALESCE(?, endDate), status = COALESCE(?, status), manager = COALESCE(?, manager) WHERE id = ?`;
  db.run(query, [name, description, startDate, endDate, status, manager, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Project updated', changes: this.changes });
  });
});

// DELETE project
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Project deleted', changes: this.changes });
  });
});

export default router;
