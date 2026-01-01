const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appAPI', {
  fetchStations: async () => {
    const res = await fetch('https://api.zenwave.net/v1/__mobile/app/pulsefm/stations');
    return res.json();
  }
});

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close')
});

contextBridge.exposeInMainWorld('discordRPC', {
  update: (station, since, icon) => ipcRenderer.send('discord-rpc-update', { station, since, icon })
});