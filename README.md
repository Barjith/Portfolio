# AgriSense Dashboard (Smart Agriculture)

A responsive, local web dashboard for IoT tiered data processing in agriculture. This project is designed as a professional base for connecting Arduino / ESP32 / sensors via serial, MQTT, or REST to a web frontend.

## 📁 Folder Structure

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `README.md`

## 🚀 Run Locally

1. Open `c:\IOT_project` in VS Code.
2. Install Live Server extension (optional).
3. Open `index.html` with Live Server or file protocol.

## 🧪 Features Implemented

- Dashboard style matching the given snapshot
- Top navigation tabs (UI only)
- Real-time simulated sensor data update loop
- Soil moisture chart and field zone progress
- Alerts badge + status color logic

## 🔌 Connect real IoT in future

- Add backend API endpoint like `/api/sensors` using Node.js / Python / Flask
- Arduino -> ESP32 -> Wi-Fi -> HTTP POST JSON (or MQTT broker) to feed data into this front-end
- Replace `app.js` simulation with live fetch polling:
  - `const resp = await fetch('/api/sensors');`
  - `updateDisplay(await resp.json());`

## 🎯 Next steps for project report

- Document sensor hardware (DHT22, capacitive soil sensor, BH1750)
- Tiered architecture section:
  1. Device layer (Arduino/ESP)
  2. Gateway layer (Raspberry Pi / Edge Node)
  3. Cloud processing (Node/Flask + database)
  4. Visualization (this UI)
- Add user authentication + historical data retention (SQLite/MongoDB)
