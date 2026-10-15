const { app, BrowserWindow } = require('electron');
const path = require('path');

// Override process.env.PORT for the express server
process.env.PORT = '5001';
process.env.DB_PATH = path.join(app.getPath('userData'), 'database.sqlite');

// Start the express server
require('./dist/index.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'EduSprint',
    icon: path.join(__dirname, 'public/favicon.svg'),
    webPreferences: {
      nodeIntegration: true,
    }
  });

  win.setMenuBarVisibility(false);
  win.loadURL('http://localhost:5001');
}

app.whenReady().then(() => {
  // Give the server 1 second to start before opening the window
  setTimeout(createWindow, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
