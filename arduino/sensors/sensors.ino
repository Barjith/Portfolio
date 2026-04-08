// AgriSense — Soil Moisture Only
// Arduino UNO R4 WiFi
// Soil moisture sensor signal → A0

#define SOIL_PIN A0

void setup() {
  Serial.begin(9600);
  delay(1000);
}

void loop() {
  int soilRaw = analogRead(SOIL_PIN);

  // Map: 1023 = dry (0%), ~300 = wet (100%)
  int soil = map(soilRaw, 1023, 300, 0, 100);
  soil     = constrain(soil, 0, 100);

  // Send JSON
  Serial.print("{\"soil\":");
  Serial.print(soil);
  Serial.print(",\"temp\":0,\"humidity\":0,\"light\":0}");
  Serial.print("\r\n");

  delay(2000);
}
