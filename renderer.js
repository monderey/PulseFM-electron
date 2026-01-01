
const listEl = document.getElementById('stations');
const player = document.getElementById('player');
const currentStationEl = document.getElementById('current-station');

let currentActiveBtn = null;
let currentStationName = '';

async function loadStations() {
  try {
    const stations = await window.appAPI.fetchStations();

    if (!Array.isArray(stations)) {
      listEl.innerHTML = '<li>Nieprawidłowe dane z API</li>';
      return;
    }

    listEl.innerHTML = '';

    stations.forEach(station => {
      const li = document.createElement('li');
      const btn = document.createElement('button');

      btn.innerHTML = `
        <strong>${station.name}</strong><br>
        <small>${station.city}</small>
      `;

      btn.onclick = () => {
        let iconKey = station.icon ? station.icon.replace(/^@drawable\//, '') : undefined;

        playStation(station.url, station.name, iconKey);

        if (currentActiveBtn) currentActiveBtn.classList.remove('active');

        btn.classList.add('active');
        currentActiveBtn = btn;
      };

      li.appendChild(btn);
      listEl.appendChild(li);
    });

  } catch (err) {
    listEl.innerHTML = `<li>Błąd: ${err.message}</li>`;
  }
}

let stationStartTime = null;

function playStation(url, name, icon) {
  player.src = url;
  player.play().catch(console.error);

  currentStationName = name || '';
  currentStationEl.textContent = name ? `Słuchasz: ${name}` : 'Nie słuchasz żadnej stacji';

  stationStartTime = Date.now();

  if (window.discordRPC && name) {
    window.discordRPC.update(name, stationStartTime, icon || 'pulsefm');
  }
}

loadStations();
