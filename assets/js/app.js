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
  const soil     = makeStatus(data.soil,     60, 85,    34,   '%');
  const temp     = makeStatus(data.temp,     26, 35,    10,   '°C');
  const humidity = makeStatus(data.humidity, 60, 78,    30,   '%');
  const light    = makeStatus(data.light,  5000, 12000, 1000, ' lx');

  document.getElementById('soilValue').textContent     = data.soil;
  document.getElementById('tempValue').textContent     = data.temp;
  document.getElementById('humidityValue').textContent = data.humidity;
  document.getElementById('lightValue').textContent    = data.light;

  [
    { id: 'soilStatus',     s: soil },
    { id: 'tempStatus',     s: temp },
    { id: 'humidityStatus', s: humidity },
    { id: 'lightStatus',    s: light },
  ].forEach(({ id, s }) => {
    const el = document.getElementById(id);
    el.className = `status ${s.cls}`;
    el.textContent = s.text;
  });

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
  const alertCount = [soil, temp, humidity, light].filter((f) => f.cls === 'alert').length;
  document.getElementById('alertCount').textContent = alertCount;
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
  });
});
