const updateDisplay = (data) => {
  const makeStatus = (value, good, high, low, suffix = '') => {
    if (value <= low || value >= high) {
      return { text: `${value}${suffix} — Attention`, cls: 'alert' };
    }
    if (value < good) return { text: `${value}${suffix} — Optimal range`, cls: 'optimal' };
    return { text: `${value}${suffix} — Slightly high`, cls: 'caution' };
  };

  const soil = makeStatus(data.soil, 60, 85, 34, '%');
  const temp = makeStatus(data.temp, 26, 35, 10, '°C');
  const humidity = makeStatus(data.humidity, 60, 78, 30, '%');
  const light = makeStatus(data.light, 5000, 12000, 1000, ' lx');

  document.getElementById('soilValue').textContent = data.soil;
  document.getElementById('tempValue').textContent = data.temp;
  document.getElementById('humidityValue').textContent = data.humidity;
  document.getElementById('lightValue').textContent = data.light;

  const statuses = [
    { id: 'soilStatus', value: soil },
    { id: 'tempStatus', value: temp },
    { id: 'humidityStatus', value: humidity },
    { id: 'lightStatus', value: light },
  ];

  statuses.forEach((item) => {
    const el = document.getElementById(item.id);
    el.className = `status ${item.value.cls}`;
    el.textContent = item.value.text;
  });

  const zones = [
    { idVal: 'zoneAValue', idProg: 'zoneAProgress', value: data.zones.a },
    { idVal: 'zoneBValue', idProg: 'zoneBProgress', value: data.zones.b },
    { idVal: 'zoneCValue', idProg: 'zoneCProgress', value: data.zones.c },
  ];

  zones.forEach((zone) => {
    document.getElementById(zone.idVal).textContent = zone.value;
    document.getElementById(zone.idProg).style.width = `${zone.value}%`;
  });

  // Update chart bars
  const chartContainer = document.getElementById('moistureChart');
  chartContainer.innerHTML = '';
  data.history.forEach((y) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.max(Math.min(y, 100), 8)}%`;
    chartContainer.appendChild(bar);
  });

  const alertCountEl = document.getElementById('alertCount');
  const alertCount = [soil, temp, humidity, light].filter((f) => f.cls === 'alert').length;
  alertCountEl.textContent = alertCount;
};

const randomInRange = (from, to) => Math.round(from + Math.random() * (to - from));

const generateTelemetry = (prevHistory = []) => {
  const soil = randomInRange(52, 82);
  const temp = randomInRange(24, 32);
  const humidity = randomInRange(58, 76);
  const light = randomInRange(4200, 6800);
  const zones = {
    a: randomInRange(62, 75),
    b: randomInRange(36, 50),
    c: randomInRange(78, 88),
  };

  const history = prevHistory.length ? prevHistory.slice(1) : [];
  history.push(soil);
  while (history.length < 12) {
    history.unshift(randomInRange(45, 85));
  }

  return { soil, temp, humidity, light, zones, history };
};

let state = generateTelemetry([]);
updateDisplay(state);

setInterval(() => {
  state = generateTelemetry(state.history);
  updateDisplay(state);
}, 3500);

// Tab switch simulation
const tabs = document.querySelectorAll('.tab');
tabs.forEach((button) => {
  button.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    button.classList.add('active');
    // future: dynamic sections for each tab
  });
});
