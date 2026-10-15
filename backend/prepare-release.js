const fs = require('fs');
const path = require('path');

const releaseDir = path.join(__dirname, '../EduSprint-Release');
if (!fs.existsSync(releaseDir)) fs.mkdirSync(releaseDir);

// Copy the exe
const exePath = path.join(__dirname, 'EduSprint.exe');
if (fs.existsSync(exePath)) {
  fs.copyFileSync(exePath, path.join(releaseDir, 'EduSprint.exe'));
}

// Check for sqlite3 bindings, some versions of pkg output them next to the exe
const files = fs.readdirSync(__dirname);
files.forEach(file => {
  if (file.endsWith('.node')) {
    fs.copyFileSync(path.join(__dirname, file), path.join(releaseDir, file));
  }
});

// Create an empty database file so it starts fresh, or copy existing demo db
const dbPath = path.join(__dirname, '../database.sqlite');
if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, path.join(releaseDir, 'database.sqlite'));
}

console.log('Release package prepared at EduSprint-Release');
