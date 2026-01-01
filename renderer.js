
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
        playStation(station.url, station.name);
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


function playStation(url, name) {
  player.src = url;
  player.play().catch(console.error);
  currentStationName = name || '';
  currentStationEl.textContent = name ? `Słuchasz: ${name}` : 'Nie słuchasz żadnej stacji';
}

loadStations();
