const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 425,
    height: 685,
    roundedCorners: true,
    resizable: false,
    maximizable: false,
    minimizable: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'pulsefm.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');

  win.webContents.on('before-input-event', (event, input) => {
    if (
      (input.control || input.meta) &&
      input.shift &&
      (input.key.toLowerCase() === 'i' || input.key.toLowerCase() === 'j')
    ) {
      event.preventDefault();
    }
    if ((input.key === 'F12')) {
      event.preventDefault();
    }
  });

  win.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  win.removeMenu && win.removeMenu();
}

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
