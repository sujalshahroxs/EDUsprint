import { Router } from 'express';
import db from '../database/db';

const router = Router();

// GET tasks (optionally by projectId or sprintId)
router.get('/', (req, res) => {
  const { projectId, sprintId } = req.query;
  let query = 'SELECT t.*, j.jiraIssueKey, j.jiraUrl FROM tasks t LEFT JOIN jira_issue_mappings j ON j.localId = t.id AND j.entityType = "task" WHERE 1=1';
  const params: any[] = [];

  if (projectId) {
    query += ' AND t.projectId = ?';
    params.push(projectId);
  }
  if (sprintId) {
    query += ' AND t.sprintId = ?';
    params.push(sprintId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single task
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Task not found' });
    res.json(row);
  });
});

// CREATE task
router.post('/', (req, res) => {
  const { projectId, sprintId, title, description, status, priority, assignee, deadline } = req.body;
  if (!projectId || !title) return res.status(400).json({ error: 'Project ID and Title are required' });

  const query = `INSERT INTO tasks (projectId, sprintId, title, description, status, priority, assignee, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [projectId, sprintId || null, title, description, status || 'TO DO', priority || 'Medium', assignee, deadline], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, ...req.body, status: status || 'TO DO', priority: priority || 'Medium' });
  });
});

// UPDATE task
router.put('/:id', (req, res) => {
  const { sprintId, title, description, status, priority, assignee, deadline } = req.body;
  const query = `UPDATE tasks SET sprintId = COALESCE(?, sprintId), title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status), priority = COALESCE(?, priority), assignee = COALESCE(?, assignee), deadline = COALESCE(?, deadline) WHERE id = ?`;
  db.run(query, [sprintId, title, description, status, priority, assignee, deadline, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task updated', changes: this.changes });
  });
});

// DELETE task
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted', changes: this.changes });
  });
});

export default router;
