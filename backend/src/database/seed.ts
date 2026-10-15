import db from './db';

export function runSeed(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Clear existing data
      db.run("DELETE FROM tasks");
      db.run("DELETE FROM risks");
      db.run("DELETE FROM sprints");
      db.run("DELETE FROM projects");

      // Insert Project (Academic period Fall 2026)
      db.run(`INSERT INTO projects (id, name, description, startDate, endDate, status, manager)
              VALUES (1, 'E-Learning Platform', 'A comprehensive agile platform for students with real-time tracking.', '2026-09-01', '2026-11-30', 'Active', 'Sujal Shah')`);

      // Insert Sprints
      db.run(`INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, status)
              VALUES (1, 1, 'Sprint 1', 'Setup architecture and auth', '2026-09-01', '2026-09-14', 'Completed')`);
      db.run(`INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, status)
              VALUES (2, 1, 'Sprint 2', 'Core dashboard and API integration', '2026-09-15', '2026-09-28', 'Completed')`);
      db.run(`INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, status)
              VALUES (3, 1, 'Sprint 3', 'Risk monitoring and Kanban board', '2026-09-29', '2026-10-12', 'Active')`);
      db.run(`INSERT INTO sprints (id, projectId, name, goal, startDate, endDate, status)
              VALUES (4, 1, 'Sprint 4', 'Reporting and final deployment', '2026-10-13', '2026-10-26', 'Planned')`);

      // Insert Tasks
      const tasks = [
        { title: 'Project Scoping', status: 'DONE', priority: 'Critical', assignee: 'Sujal Shah', sprintId: 1, deadline: '2026-09-05' },
        { title: 'User Authentication', status: 'DONE', priority: 'High', assignee: 'Sujal Shah', sprintId: 1, deadline: '2026-09-10' },
        { title: 'Database Schema Design', status: 'DONE', priority: 'High', assignee: 'Sujal Shah', sprintId: 1, deadline: '2026-09-12' },

        { title: 'Dashboard UI Mockups', status: 'DONE', priority: 'Medium', assignee: 'Sujal Shah', sprintId: 2, deadline: '2026-09-18' },
        { title: 'API Integration', status: 'DONE', priority: 'Critical', assignee: 'Sujal Shah', sprintId: 2, deadline: '2026-09-22' },
        { title: 'Course Content Delivery', status: 'DONE', priority: 'High', assignee: 'Sujal Shah', sprintId: 2, deadline: '2026-09-26' },

        { title: 'Risk Matrix Visualization', status: 'TESTING', priority: 'High', assignee: 'Sujal Shah', sprintId: 3, deadline: '2026-10-05' },
        { title: 'Kanban Drag & Drop', status: 'TESTING', priority: 'Medium', assignee: 'Sujal Shah', sprintId: 3, deadline: '2026-10-08' },
        { title: 'Analytics Charting', status: 'IN PROGRESS', priority: 'High', assignee: 'Sujal Shah', sprintId: 3, deadline: '2026-10-10' },
        { title: 'User Permissions', status: 'TO DO', priority: 'Medium', assignee: 'Sujal Shah', sprintId: 3, deadline: '2026-10-11' },
        { title: 'UI Accessibility Testing', status: 'IN PROGRESS', priority: 'Low', assignee: 'Sujal Shah', sprintId: 3, deadline: '2026-10-09' },

        { title: 'PDF Report Generation', status: 'TO DO', priority: 'High', assignee: 'Sujal Shah', sprintId: 4, deadline: '2026-10-15' },
        { title: 'Electron Packaging', status: 'TO DO', priority: 'Critical', assignee: 'Sujal Shah', sprintId: 4, deadline: '2026-10-20' },
        { title: 'Public Documentation', status: 'TO DO', priority: 'Medium', assignee: 'Sujal Shah', sprintId: 4, deadline: '2026-10-24' },
      ];

      tasks.forEach((t) => {
        db.run(`INSERT INTO tasks (projectId, sprintId, title, status, priority, assignee, deadline)
                VALUES (1, ?, ?, ?, ?, ?, ?)`,
                [t.sprintId, t.title, t.status, t.priority, t.assignee, t.deadline]);
      });

      // Insert Risks
      const risks = [
        { title: 'Late Development / Feature Creep', prob: 4, imp: 4, severity: 'CRITICAL', mitigation: 'Strict sprint timeboxing and scope freeze.' },
        { title: 'Server Downtime during Demo', prob: 2, imp: 5, severity: 'HIGH', mitigation: 'Package as an offline-first local Electron app.' },
        { title: 'Security Vulnerability in Auth', prob: 2, imp: 5, severity: 'HIGH', mitigation: 'Use established JWT libraries and robust hashing.' },
        { title: 'Database Data Loss', prob: 1, imp: 5, severity: 'MEDIUM', mitigation: 'Implement local file backups and atomic transactions.' },
        { title: 'API Integration Delay', prob: 3, imp: 3, severity: 'MEDIUM', mitigation: 'Use robust mock APIs early in development.' },
        { title: 'UI Responsiveness Issues', prob: 3, imp: 2, severity: 'MEDIUM', mitigation: 'Mobile-first design with Tailwind breakpoints.' },
        { title: 'Third-Party Library Conflicts', prob: 2, imp: 4, severity: 'MEDIUM', mitigation: 'Lock dependencies and use strict Vite bundling.' },
        { title: 'Minor Layout Bugs', prob: 4, imp: 1, severity: 'LOW', mitigation: 'Consistent manual testing before release.' },
      ];

      risks.forEach(r => {
        db.run(`INSERT INTO risks (projectId, title, probability, impact, score, severity, mitigation, status)
                VALUES (1, ?, ?, ?, ?, ?, ?, 'Open')`,
                [r.title, r.prob, r.imp, r.prob * r.imp, r.severity, r.mitigation]);
      });

      db.run("COMMIT", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

if (require.main === module) {
  runSeed().then(() => {
    console.log('Seed complete');
    process.exit(0);
  });
}
