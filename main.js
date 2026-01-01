const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Client } = require('@xhayper/discord-rpc');

const clientId = '1267520680128155681';
const rpc = new Client({ clientId });

rpc.on('ready', () => {
  rpc.user?.setActivity({
    details: 'PulseFM - Radio Online',
    state: 'Obecnie nic nie słucha',
    largeImageText: 'Powered by Zenwave.net',
    largeImageKey: 'pulsefm',
    instance: false,
    type: 2,
  }).catch(console.error);
});

ipcMain.on('discord-rpc-update', (event, { station, since, icon }) => {
  if (!rpc) return;
  rpc.user?.setActivity({
    details: "PulseFM - Radio Online",
    state: `Słucha: ${station}`,
    largeImageText: 'Powered by Zenwave.net',
    largeImageKey: icon || 'pulsefm',
    instance: false,
    type: 2,
  }).catch(console.error);
});

rpc.on('error', console.error);
rpc.on('disconnected', console.warn);

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

app.whenReady().then(() => {
  rpc.login({ clientId }).catch(console.error);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
