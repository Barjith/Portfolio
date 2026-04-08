// AgriSense — Serial Bridge + Web Server
// Serves the dashboard at http://localhost:5000
// Sensor API at http://localhost:5000/api/sensors

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM7';
const BAUD_RATE   = 9600;
const HTTP_PORT   = 5000;
const ROOT        = path.join(__dirname, '..');  // project root (index.html lives here)

// ── Latest sensor state ───────────────────────────────────────────────────────
let latest = {
  soil: 0, temp: 0, humidity: 0, light: 0,
  zones: { a: 0, b: 0, c: 0 },
  timestamp: null,
};

// ── Serial connection ─────────────────────────────────────────────────────────
const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n', encoding: 'utf8' }));

port.on('open', () => console.log(`Serial open on ${SERIAL_PORT}`));
port.on('error', (err) => console.error('Serial error:', err.message));

parser.on('data', (line) => {
  try {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) return;
    const data = JSON.parse(trimmed);
    latest = {
      soil:      data.soil     ?? latest.soil,
      temp:      data.temp     ?? latest.temp,
      humidity:  data.humidity ?? latest.humidity,
      light:     data.light    ?? latest.light,
      zones: data.zones ?? {
        a: data.soil ?? latest.zones.a,
        b: data.soil ?? latest.zones.b,
        c: data.soil ?? latest.zones.c,
      },
      timestamp: new Date().toISOString(),
    };
    console.log('Sensor update:', latest);
  } catch { }
});

// ── MIME types ────────────────────────────────────────────────────────────────
const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Sensor API
  if (req.url.startsWith('/api/sensors')) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    return res.end(JSON.stringify(latest));
  }

  // Serve static files
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  res.setHeader('Content-Type', mime[ext] || 'text/plain');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(HTTP_PORT, () => {
  console.log(`Dashboard: http://localhost:${HTTP_PORT}`);
  console.log(`Sensor API: http://localhost:${HTTP_PORT}/api/sensors`);
});
