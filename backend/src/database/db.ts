import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON;");

    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      startDate TEXT,
      endDate TEXT,
      status TEXT,
      manager TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      name TEXT NOT NULL,
      goal TEXT,
      startDate TEXT,
      endDate TEXT,
      status TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      sprintId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT,
      priority TEXT,
      assignee TEXT,
      deadline TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(sprintId) REFERENCES sprints(id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      probability INTEGER NOT NULL,
      impact INTEGER NOT NULL,
      score INTEGER NOT NULL,
      severity TEXT NOT NULL,
      mitigation TEXT,
      owner TEXT,
      status TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jira_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      clientId TEXT,
      clientSecret TEXT,
      accessToken TEXT,
      refreshToken TEXT,
      cloudId TEXT,
      expiresAt INTEGER,
      selectedProjectId TEXT,
      selectedProjectKey TEXT,
      selectedProjectName TEXT,
      selectedBoardId TEXT,
      selectedBoardName TEXT,
      lastSync DATETIME
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jira_issue_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entityType TEXT NOT NULL,
      localId INTEGER NOT NULL,
      jiraIssueId TEXT NOT NULL,
      jiraIssueKey TEXT NOT NULL,
      jiraUrl TEXT,
      lastSynced DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entityType, localId)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jira_sprint_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      localSprintId INTEGER NOT NULL,
      jiraSprintId TEXT NOT NULL,
      UNIQUE(localSprintId)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS jira_sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      direction TEXT,
      entity TEXT,
      jiraKey TEXT,
      result TEXT,
      message TEXT
    )`);
  });
}

export default db;
