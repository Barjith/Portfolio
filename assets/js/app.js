// ── Config ────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:5000/api/sensors';
const POLL_INTERVAL = 3500; // ms

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomInRange = (from, to) => Math.round(from + Math.random() * (to - from));

const makeStatus = (value, good, high, low, suffix = '') => {
  if (value <= low || value >= high)
    return { text: `${value}${suffix} — Attention`, cls: 'alert' };
  if (value < good)
    return { text: `${value}${suffix} — Optimal range`, cls: 'optimal' };
  return { text: `${value}${suffix} — Slightly high`, cls: 'caution' };
};

// ── Connection status UI ──────────────────────────────────────────────────────
const setConnStatus = (mode) => {
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');
  if (mode === 'live') {
    dot.className = 'conn-dot live';
    label.textContent = 'Live sensor';
  } else if (mode === 'sim') {
    dot.className = 'conn-dot sim';
    label.textContent = 'Simulation';
  } else {
    dot.className = 'conn-dot';
    label.textContent = 'Connecting...';
  }
};

// ── Display ───────────────────────────────────────────────────────────────────
const updateDisplay = (data) => {
  const soil = makeStatus(data.soil, 60, 85, 34, '%');

  document.getElementById('soilValue').textContent = data.soil;

  const el = document.getElementById('soilStatus');
  el.className = `status ${soil.cls}`;
  el.textContent = soil.text;

  // Sync sensors panel
  document.getElementById('soilValue2').textContent = data.soil;
  const el2 = document.getElementById('soilStatus2');
  el2.className = `status ${soil.cls}`;
  el2.textContent = soil.text;

  [
    { idVal: 'zoneAValue', idProg: 'zoneAProgress', value: data.zones.a },
    { idVal: 'zoneBValue', idProg: 'zoneBProgress', value: data.zones.b },
    { idVal: 'zoneCValue', idProg: 'zoneCProgress', value: data.zones.c },
  ].forEach(({ idVal, idProg, value }) => {
    document.getElementById(idVal).textContent = value;
    document.getElementById(idProg).style.width = `${value}%`;
  });

  // Chart
  const chart = document.getElementById('moistureChart');
  chart.innerHTML = '';
  data.history.forEach((y) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.max(Math.min(y, 100), 8)}%`;
    chart.appendChild(bar);
  });

  // Alert badge
  const alertCount = [soil].filter((f) => f.cls === 'alert').length;
  document.getElementById('alertCount').textContent = alertCount;

  // Soil > 80% alert
  const alertPanel = document.getElementById('alertPanel');
  const alertMsg   = document.getElementById('alertMsg');
  if (data.soil > 80) {
    alertMsg.textContent = `⚠️ Soil moisture is ${data.soil}% — above 80%. Risk of waterlogging.`;
    alertPanel.style.display = 'block';
  } else {
    alertPanel.style.display = 'none';
  }
};

// ── Simulation fallback ───────────────────────────────────────────────────────
const generateTelemetry = (prevHistory = []) => {
  const soil     = randomInRange(52, 82);
  const temp     = randomInRange(24, 32);
  const humidity = randomInRange(58, 76);
  const light    = randomInRange(4200, 6800);
  const zones    = {
    a: randomInRange(62, 75),
    b: randomInRange(36, 50),
    c: randomInRange(78, 88),
  };

  const history = prevHistory.length ? prevHistory.slice(1) : [];
  history.push(soil);
  while (history.length < 12) history.unshift(randomInRange(45, 85));

  return { soil, temp, humidity, light, zones, history };
};

// ── Real-time polling ─────────────────────────────────────────────────────────
let state = generateTelemetry([]);
updateDisplay(state);

/**
 * Expected API response shape from your hardware endpoint:
 * {
 *   "soil": 65,
 *   "temp": 27.4,
 *   "humidity": 62,
 *   "light": 5200,
 *   "zones": { "a": 68, "b": 44, "c": 81 }
 * }
 */
const fetchSensorData = async () => {
  try {
    const res = await fetch(API_URL + '?t=' + Date.now(), { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error('Bad response');
    const raw = await res.json();

    // Merge API data with local history tracking
    const history = state.history.slice(1);
    history.push(raw.soil ?? state.soil);
    while (history.length < 12) history.unshift(randomInRange(45, 85));

    state = {
      soil:     raw.soil     ?? state.soil,
      temp:     raw.temp     ?? state.temp,
      humidity: raw.humidity ?? state.humidity,
      light:    raw.light    ?? state.light,
      zones:    raw.zones    ?? state.zones,
      history,
    };

    setConnStatus('live');
  } catch {
    // Hardware not reachable — use simulation
    state = generateTelemetry(state.history);
    setConnStatus('sim');
  }

  updateDisplay(state);
};

// Kick off immediately then poll
fetchSensorData();
setInterval(fetchSensorData, POLL_INTERVAL);

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    document.getElementById('sensorsPanel').style.display = tab === 'sensors' ? 'block' : 'none';
  });
});
