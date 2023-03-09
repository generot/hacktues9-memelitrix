#include <WiFiEsp.h>

#define BUFFER_MAX 64
#define CREDENTIALS_MAX 32

#define BAUD_RATE 9600

#define BL_SERIAL Serial1
#define WIFI_SERIAL Serial2

#define BL_ENABLE_PIN 22

char bl_res_buffer[BUFFER_MAX];

char bl_ssid[CREDENTIALS_MAX];
char bl_pass[CREDENTIALS_MAX];

int bl_cred_ix = 0;
bool bl_user_connected = false;

bool bl_parse_credentials(void) {
  int i = 2;

#define FILL_FIELD(buff)  \
  for(; i < CREDENTIALS_MAX && bl_res_buffer[i] != '$'; i++) {  \
    buff[bl_cred_ix++] = bl_res_buffer[i];                   \
  }

  FILL_FIELD(bl_ssid);

  i++;
  bl_cred_ix = 0;
  
  FILL_FIELD(bl_pass);

#undef FILL_FIELD

  return bl_res_buffer[i] != '$';
}

bool bl_check_credentials(char expected_type) {
  return bl_res_buffer[0] == expected_type;
}

bool bl_has_connected(void) {
  return !strncmp(bl_res_buffer, "CONNECTED", 9);
}

bool bl_has_disconnected(void) {
  return !strncmp(bl_res_buffer, "+DISC:SUCCESS", 13);
}

bool bl_get_response(void) {
  if(!BL_SERIAL.available()) {
    return false;
  }
  
  for(int i = 0; i < BUFFER_MAX - 1; i++) {
    bl_res_buffer[i] = 0;
  }

  BL_SERIAL.readBytesUntil('\n', bl_res_buffer, BUFFER_MAX - 1);

  return true;
}

void setup() {
  Serial.begin(BAUD_RATE);
  
  BL_SERIAL.begin(BAUD_RATE);
  BL_SERIAL.setTimeout(500);

  pinMode(BL_ENABLE_PIN, OUTPUT);

  digitalWrite(BL_ENABLE_PIN, LOW);
}

void loop() {
  if(bl_get_response()) {
    if(bl_has_connected()) {
      Serial.println("A user has connected.");
    }

    if(bl_has_disconnected()) {
      Serial.println("A user has disconnected.");
    }

    if(bl_check_credentials('W')) {
      Serial.println("Wifi credentials entered.");
      bl_parse_credentials();

      Serial.println("SSID: " + String(bl_ssid));
      Serial.println("PASS: " + String(bl_pass));
    }

    if(bl_check_credentials('U')) {
      Serial.println("User credentials entered.");
      bl_parse_credentials();

      Serial.println("SSID: " + String(bl_ssid));
      Serial.println("PASS: " + String(bl_pass));
    }
  }
  
  if(Serial.available()) {
    //BL_SERIAL.write((char)Serial.read());
    BL_SERIAL.write(Serial.read());
  }
}
