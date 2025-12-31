const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appAPI', {
  fetchStations: async () => {
    const res = await fetch('https://api.zenwave.net/v1/__mobile/app/pulsefm/stations');
    return res.json();
  }
});