int soilPin = A0;
int tempPin = A1;

int soilValue;
float temperature;

void setup()
{
  Serial.begin(9600);
}

void loop()
{
  soilValue = analogRead(soilPin);

  int tempValue = analogRead(tempPin);

  temperature = tempValue * 0.488;

  Serial.print("Soil Moisture: ");
  Serial.print(soilValue);

  Serial.print("  Temperature: ");
  Serial.println(temperature);

  delay(1000);
}