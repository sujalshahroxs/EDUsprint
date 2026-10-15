const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.serialize(() => {
  db.run('ALTER TABLE tasks ADD COLUMN startDate TEXT;', (err) => console.log(err ? err.message : 'added startDate'));
  db.run('ALTER TABLE tasks ADD COLUMN storyPoints INTEGER DEFAULT 0;', (err) => console.log(err ? err.message : 'added storyPoints'));
  db.run("UPDATE tasks SET startDate = '2026-09-01' WHERE startDate IS NULL;", (err) => console.log(err ? err.message : 'updated startDates'));
  db.run("UPDATE tasks SET storyPoints = 5 WHERE storyPoints = 0;", (err) => console.log(err ? err.message : 'updated storyPoints'));
});
