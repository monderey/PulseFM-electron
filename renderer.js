
const listEl = document.getElementById('stations');
const player = document.getElementById('player');
const currentStationEl = document.getElementById('current-station');
const playPauseBtn = document.getElementById('playpause-btn');
const volumeSlider = document.getElementById('volume-slider');
const listeningTimeEl = document.getElementById('listening-time');
const headerEl = document.querySelector('.bnieu');

const navOkolica = document.getElementById('nav-okolica');
const navWojewodztwa = document.getElementById('nav-wojewodztwa');
const navSwiat = document.getElementById('nav-swiat');
const navUstawienia = document.getElementById('nav-ustawienia');

let listeningInterval = null;
let isPlaying = true;

let currentActiveBtn = null;
let currentStationName = '';
let currentView = 'okolica';
let currentWojewodztwoData = null;

function getIconFile(iconKey) {
  return iconKey ? `icon/${iconKey}.jpg` : 'icon/pulsefm.jpg';
}

function createIconImg(iconKey, altText, style = '') {
  const img = document.createElement('img');
  const basePath = iconKey ? `icon/${iconKey}` : 'icon/pulsefm';
  img.src = `${basePath}.jpg`;
  img.alt = altText;
  img.style.cssText = style || 'display: block; margin: 0 0 6px 0; width: 64px; height: 64px; border-radius: 12px; object-fit: cover;';
  img.onerror = function() {
    if (this.src.endsWith('.jpg')) {
      this.src = `${basePath}.png`;
    }
  };
  return img;
}

async function loadStations() {
  try {
    const stations = await window.appAPI.fetchStations();

    if (!Array.isArray(stations)) {
      listEl.innerHTML = '<li>Nieprawidłowe dane z API</li>';
      hideLoadingAndShowApp();
      return;
    }

    listEl.innerHTML = '';

    stations.forEach(station => {
      const li = document.createElement('li');
      const btn = document.createElement('button');

      let iconKey = station.icon ? station.icon.replace(/^@drawable\//, '') : undefined;
      
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;';
      
      const img = createIconImg(iconKey, station.name);
      wrapper.appendChild(img);
      
      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = 'font-size: 13px; text-align: center; color: #e6eaf3;';
      nameDiv.textContent = station.name;
      wrapper.appendChild(nameDiv);
      
      btn.appendChild(wrapper);

      btn.onclick = () => {
        playStation(station.url, station.name, iconKey);

        if (currentActiveBtn) currentActiveBtn.classList.remove('active');

        btn.classList.add('active');
        currentActiveBtn = btn;
      };

      li.appendChild(btn);
      listEl.appendChild(li);
    });
    hideLoadingAndShowApp();
  } catch (err) {
    listEl.innerHTML = `<li>Błąd: ${err.message}</li>`;
    hideLoadingAndShowApp();
  }
}

function hideLoadingAndShowApp() {
  const loading = document.getElementById('loading-overlay');
  const app = document.getElementById('main-app');
  if (loading) loading.style.display = 'none';
  if (app) app.style.display = '';
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

    if (stationStartTime && !listeningInterval) {
      listeningInterval = setInterval(updateListeningTime, 1000);
    }

    if (window.discordRPC && currentStationName) {
      window.discordRPC.update(currentStationName, stationStartTime);
    }
  } else {
    player.pause();
    isPlaying = false;

    if (listeningInterval) {
      clearInterval(listeningInterval);
      listeningInterval = null;
    }

    if (window.discordRPC && window.discordRPC.clear) {
      window.discordRPC.clear();
    }
  }
  updatePlayPauseBtn();
};

volumeSlider.oninput = (e) => {
  player.volume = parseFloat(e.target.value);
};

player.onplay = () => {
  isPlaying = true;
  updatePlayPauseBtn();

  if (stationStartTime && !listeningInterval) {
    listeningInterval = setInterval(updateListeningTime, 1000);
  }

  if (window.discordRPC && currentStationName) {
    window.discordRPC.update(currentStationName, stationStartTime);
  }
};
player.onpause = () => {
  isPlaying = false;
  updatePlayPauseBtn();

  if (listeningInterval) {
    clearInterval(listeningInterval);
    listeningInterval = null;
  }

  if (window.discordRPC && window.discordRPC.clear) {
    window.discordRPC.clear();
  }
};

volumeSlider.value = player.volume;
updatePlayPauseBtn();

function setActiveNav(btn) {
  document.querySelectorAll('.fweua button').forEach(b => b.classList.remove('nav-active'));
  btn.classList.add('nav-active');
}

navOkolica.onclick = () => {
  setActiveNav(navOkolica);
  currentView = 'okolica';
  headerEl.textContent = 'Wybierz swoją radio stację';
  loadStations();
};

navWojewodztwa.onclick = () => {
  setActiveNav(navWojewodztwa);
  currentView = 'wojewodztwa';
  headerEl.textContent = 'Wybierz województwo';
  loadWojewodztwa();
};

navSwiat.onclick = () => {
  setActiveNav(navSwiat);
  currentView = 'swiat';
  headerEl.textContent = 'Wybierz kraj';
  loadSwiat();
};

navUstawienia.onclick = () => {
  setActiveNav(navUstawienia);
  currentView = 'ustawienia';
  headerEl.textContent = 'Ustawienia';
  showSettings();
};

function showSettings() {
  listEl.innerHTML = '';
  
  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'settings-container';

  const aboutSection = document.createElement('div');
  aboutSection.className = 'settings-section';
  aboutSection.innerHTML = `
    <h2 class="settings-title"><i class="fas fa-info-circle"></i> O aplikacji</h2>
    <div class="settings-card">
      <div class="settings-row">
        <span class="settings-label">Nazwa</span>
        <span class="settings-value">PulseFM</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Wersja</span>
        <span class="settings-value">1.0.0</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Autor</span>
        <span class="settings-value">ZWS Group</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Licencja</span>
        <span class="settings-value">MIT</span>
      </div>
    </div>
  `;
  settingsContainer.appendChild(aboutSection);

  const techSection = document.createElement('div');
  techSection.className = 'settings-section';
  techSection.innerHTML = `
    <h2 class="settings-title"><i class="fas fa-code"></i> Wykorzystane technologie</h2>
    <div class="settings-card">
      <div class="settings-row">
        <span class="settings-label">Electron</span>
        <span class="settings-value version-badge">^26.0.0</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Electron Builder</span>
        <span class="settings-value version-badge">^24.6.0</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Discord RPC</span>
        <span class="settings-value version-badge">^1.3.0</span>
      </div>
    </div>
  `;
  settingsContainer.appendChild(techSection);

  const apiSection = document.createElement('div');
  apiSection.className = 'settings-section';
  apiSection.innerHTML = `
    <h2 class="settings-title"><i class="fas fa-server"></i> API</h2>
    <div class="settings-card">
      <div class="settings-row">
        <span class="settings-label">Dostawca</span>
        <span class="settings-value">Zenwave API</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Endpoint</span>
        <span class="settings-value api-url">api.zenwave.net</span>
      </div>
    </div>
  `;
  settingsContainer.appendChild(apiSection);

  const thanksSection = document.createElement('div');
  thanksSection.className = 'settings-section';
  thanksSection.innerHTML = `
    <h2 class="settings-title"><i class="fas fa-heart"></i> Podziękowania</h2>
    <div class="settings-card thanks-card">
      <p>Dziękujemy wszystkim twórcom bibliotek open-source, które umożliwiły stworzenie tej aplikacji.</p>
      <p>Specjalne podziękowania dla społeczności Electron oraz wszystkich kontrybutorów.</p>
    </div>
  `;
  settingsContainer.appendChild(thanksSection);
  
  listEl.appendChild(settingsContainer);
}

async function loadSwiat() {
  listEl.innerHTML = '<li class="loading-item">Ładowanie krajów...</li>';
  try {
    const data = await window.appAPI.fetchSwiat();
    if (!Array.isArray(data)) {
      listEl.innerHTML = '<li>Nieprawidłowe dane z API</li>';
      return;
    }
    listEl.innerHTML = '';
    data.forEach(country => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      let iconKey = country.icon ? country.icon.replace(/^@drawable\//, '') : undefined;
      
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;';
      
      const img = createIconImg(iconKey, country.country, 'display: block; margin: 0 0 6px 0; width: 64px; height: 48px; border-radius: 12px;');
      wrapper.appendChild(img);
      
      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = 'font-size: 12px; text-align: center; color: #e6eaf3;';
      nameDiv.textContent = country.country;
      wrapper.appendChild(nameDiv);
      
      const countDiv = document.createElement('div');
      const stationCount = country.stations ? country.stations.length : 0;
      countDiv.style.cssText = 'font-size: 12px; text-align: center; color: #888;';
      countDiv.textContent = `${stationCount} ${stationCount === 1 ? 'stacja' : (stationCount >= 2 && stationCount <= 4 ? 'stacje' : 'stacji')}`;
      wrapper.appendChild(countDiv);
      
      btn.appendChild(wrapper);
      btn.onclick = () => {
        showCountryStations(country);
      };
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  } catch (err) {
    listEl.innerHTML = `<li>Błąd: ${err.message}</li>`;
  }
}

function showCountryStations(country) {
  currentView = 'country-stacje';
  headerEl.innerHTML = `<button id="back-to-countries" class="back-btn"><i class="fas fa-arrow-left"></i></button> ${country.country}`;
  document.getElementById('back-to-countries').onclick = () => {
    headerEl.textContent = 'Wybierz kraj';
    currentView = 'swiat';
    loadSwiat();
  };
  listEl.innerHTML = '';
  if (!country.stations || country.stations.length === 0) {
    listEl.innerHTML = '<li>Brak stacji w tym kraju</li>';
    return;
  }
  country.stations.forEach(station => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    let iconKey = station.icon ? station.icon.replace(/^@drawable\//, '') : undefined;
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;';
    
    const img = createIconImg(iconKey, station.name, 'display: block; margin: 0 0 6px 0; width: 64px; height: 64px; border-radius: 12px; object-fit: cover;');
    wrapper.appendChild(img);
    
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'font-size: 13px; text-align: center; color: #e6eaf3;';
    nameDiv.textContent = station.name;
    wrapper.appendChild(nameDiv);
    
    const cityDiv = document.createElement('div');
    cityDiv.style.cssText = 'font-size: 11px; text-align: center; color: #888;';
    cityDiv.textContent = station.city || '';
    wrapper.appendChild(cityDiv);
    
    btn.appendChild(wrapper);
    btn.onclick = () => {
      playStation(station.url, station.name, iconKey);
      if (currentActiveBtn) currentActiveBtn.classList.remove('active');
      btn.classList.add('active');
      currentActiveBtn = btn;
    };
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

async function loadWojewodztwa() {
  listEl.innerHTML = '<li class="loading-item">Ładowanie województw...</li>';
  try {
    const data = await window.appAPI.fetchOkolice();
    if (!Array.isArray(data)) {
      listEl.innerHTML = '<li>Nieprawidłowe dane z API</li>';
      return;
    }
    listEl.innerHTML = '';
    data.forEach(woj => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      let iconKey = woj.icon ? woj.icon.replace(/^@drawable\//, '') : undefined;
      
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;';
      
      const img = createIconImg(iconKey, woj.woj);
      wrapper.appendChild(img);
      
      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = 'font-size: 11px; text-align: center; color: #e6eaf3;';
      nameDiv.textContent = woj.woj;
      wrapper.appendChild(nameDiv);
      
      const countDiv = document.createElement('div');
      const stationCount = woj.stations ? woj.stations.length : 0;
      countDiv.style.cssText = 'font-size: 12px; text-align: center; color: #888;';
      countDiv.textContent = `${stationCount} ${stationCount === 1 ? 'stacja' : (stationCount >= 2 && stationCount <= 4 ? 'stacje' : 'stacji')}`;
      wrapper.appendChild(countDiv);
      
      btn.appendChild(wrapper);
      btn.onclick = () => {
        currentWojewodztwoData = woj;
        showWojewodztwoStations(woj);
      };
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  } catch (err) {
    listEl.innerHTML = `<li>Błąd: ${err.message}</li>`;
  }
}

function showWojewodztwoStations(woj) {
  currentView = 'wojewodztwo-stacje';
  headerEl.innerHTML = `<button id="back-to-woj" class="back-btn"><i class="fas fa-arrow-left"></i></button> ${woj.woj}`;
  document.getElementById('back-to-woj').onclick = () => {
    headerEl.textContent = 'Wybierz województwo';
    currentView = 'wojewodztwa';
    loadWojewodztwa();
  };
  listEl.innerHTML = '';
  if (!woj.stations || woj.stations.length === 0) {
    listEl.innerHTML = '<li>Brak stacji w tym województwie</li>';
    return;
  }
  woj.stations.forEach(station => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    let iconKey = station.icon ? station.icon.replace(/^@drawable\//, '') : undefined;
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;';
    
    const img = createIconImg(iconKey, station.name);
    wrapper.appendChild(img);
    
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'font-size: 13px; text-align: center; color: #e6eaf3;';
    nameDiv.textContent = station.name;
    wrapper.appendChild(nameDiv);
    
    const cityDiv = document.createElement('div');
    cityDiv.style.cssText = 'font-size: 11px; text-align: center; color: #888;';
    cityDiv.textContent = station.city || '';
    wrapper.appendChild(cityDiv);
    
    btn.appendChild(wrapper);
    btn.onclick = () => {
      playStation(station.url, station.name, iconKey);
      if (currentActiveBtn) currentActiveBtn.classList.remove('active');
      btn.classList.add('active');
      currentActiveBtn = btn;
    };
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

loadStations();
