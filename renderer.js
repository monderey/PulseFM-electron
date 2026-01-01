
const listEl = document.getElementById('stations');
const player = document.getElementById('player');
const currentStationEl = document.getElementById('current-station');
const playPauseBtn = document.getElementById('playpause-btn');
const volumeSlider = document.getElementById('volume-slider');
const listeningTimeEl = document.getElementById('listening-time');

let listeningInterval = null;
let isPlaying = true;

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

      let iconKey = station.icon ? station.icon.replace(/^@drawable\//, '') : undefined;
      let iconFile = iconKey ? `icon/${iconKey}.jpg` : 'icon/pulsefm.jpg';
      
      btn.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;">
          <img src="${iconFile}" alt="${station.name}" style="display: block; margin: 0 0 6px 0; max-width: 64px; max-height: 64px; border-radius: 12px;" />
          <div style="font-size: 13px; text-align: center; color: #e6eaf3;">${station.name}</div>
        </div>
      `;

      btn.onclick = () => {
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

  player.play().then(() => {
    isPlaying = true;
    updatePlayPauseBtn();
  }).catch(console.error);

  currentStationName = name || '';
  currentStationEl.textContent = name ? `Odtwarzasz radio stację: ${name}` : 'Nie słuchasz żadnej radio stacji';

  stationStartTime = Date.now();

  resetListeningTimer();

  if (window.discordRPC && name) {
    window.discordRPC.update(name, stationStartTime, icon || 'pulsefm');
  }
}

function updatePlayPauseBtn() {
  if (isPlaying) {
    playPauseBtn.innerHTML = '<i class="fas fa-pause" style="color:#222;"></i>';
    playPauseBtn.title = 'Pauzuj';
  } else {
    playPauseBtn.innerHTML = '<i class="fas fa-play" style="color:#222;"></i>';
    playPauseBtn.title = 'Odtwórz';
  }
}

function resetListeningTimer() {
  if (listeningInterval) clearInterval(listeningInterval);
  updateListeningTime();
  listeningInterval = setInterval(updateListeningTime, 1000);
}

function updateListeningTime() {
  if (!stationStartTime) {
    listeningTimeEl.textContent = '00:00';
    return;
  }

  const elapsed = Math.floor((Date.now() - stationStartTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const min = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const sec = String(elapsed % 60).padStart(2, '0');

  if (hours > 0) {
    listeningTimeEl.textContent = `${hours}:${min}:${sec}`;
  } else {
    listeningTimeEl.textContent = `${min}:${sec}`;
  }
}

playPauseBtn.onclick = () => {
  if (player.paused) {
    player.play();
    isPlaying = true;
  } else {
    player.pause();
    isPlaying = false;
  }
  updatePlayPauseBtn();
};

volumeSlider.oninput = (e) => {
  player.volume = parseFloat(e.target.value);
};

player.onplay = () => {
  isPlaying = true;
  updatePlayPauseBtn();
};
player.onpause = () => {
  isPlaying = false;
  updatePlayPauseBtn();
};

volumeSlider.value = player.volume;
updatePlayPauseBtn();

loadStations();
