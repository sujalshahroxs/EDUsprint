import { Router } from 'express';
import db from '../database/db';

const router = Router();

// Function to calculate score and severity
const calculateRisk = (probability: number, impact: number) => {
  const score = probability * impact;
  let severity = 'LOW';
  if (score >= 16) severity = 'CRITICAL';
  else if (score >= 10) severity = 'HIGH';
  else if (score >= 5) severity = 'MEDIUM';

  return { score, severity };
};

// GET risks (optionally by projectId)
router.get('/', (req, res) => {
  const { projectId } = req.query;
  let query = 'SELECT r.*, j.jiraIssueKey, j.jiraUrl FROM risks r LEFT JOIN jira_issue_mappings j ON j.localId = r.id AND j.entityType = "risk" WHERE 1=1';
  const params: any[] = [];

  if (projectId) {
    query += ' AND r.projectId = ?';
    params.push(projectId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single risk
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM risks WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Risk not found' });
    res.json(row);
  });
});

// CREATE risk
router.post('/', (req, res) => {
  const { projectId, title, description, probability, impact, mitigation, owner, status } = req.body;
  if (!projectId || !title || !probability || !impact) {
    return res.status(400).json({ error: 'Project ID, Title, Probability, and Impact are required' });
  }

  const probNum = parseInt(probability);
  const impNum = parseInt(impact);

  if (probNum < 1 || probNum > 5 || impNum < 1 || impNum > 5) {
    return res.status(400).json({ error: 'Probability and Impact must be between 1 and 5' });
  }

  const { score, severity } = calculateRisk(probNum, impNum);

  const query = `INSERT INTO risks (projectId, title, description, probability, impact, score, severity, mitigation, owner, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [projectId, title, description, probNum, impNum, score, severity, mitigation, owner, status || 'Identified'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      id: this.lastID,
      ...req.body,
      score,
      severity,
      status: status || 'Identified'
    });
  });
});

// UPDATE risk
router.put('/:id', (req, res) => {
  const { title, description, probability, impact, mitigation, owner, status } = req.body;

  // First get existing risk to calculate new score if prob/impact are not provided
  db.get('SELECT * FROM risks WHERE id = ?', [req.params.id], (err, row: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Risk not found' });

    const newProb = probability ? parseInt(probability) : row.probability;
    const newImp = impact ? parseInt(impact) : row.impact;
    const { score, severity } = calculateRisk(newProb, newImp);

    const query = `UPDATE risks SET title = COALESCE(?, title), description = COALESCE(?, description), probability = ?, impact = ?, score = ?, severity = ?, mitigation = COALESCE(?, mitigation), owner = COALESCE(?, owner), status = COALESCE(?, status) WHERE id = ?`;
    db.run(query, [title, description, newProb, newImp, score, severity, mitigation, owner, status, req.params.id], function(updateErr) {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ message: 'Risk updated', changes: this.changes, score, severity });
    });
  });
});

// DELETE risk
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM risks WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Risk deleted', changes: this.changes });
  });
});

export default router;
