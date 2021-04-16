const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

require('./system/system');
require('./util/service');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const mainWindowConfig = JSON.parse(fs.readFileSync('src/settings/mainWindowConfig.json'));

function init () {
  createWindow(mainWindowConfig);
}

// FUNCTIONS
function createWindow (windowConfig) {
  const w = new BrowserWindow(windowConfig);
  w.loadFile(path.join(__dirname, 'mainScreen.html'));
  // w.webContents.openDevTools();
  w.setMenuBarVisibility(false);
  return w;
}

// APP EVENTS
app.on('ready', init);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(mainWindowConfig);
  }
});

console.log('--init index');