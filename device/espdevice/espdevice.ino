#include <SPI.h>
#include <SD.h>

#include <WiFi.h>
#include <WiFiClient.h>

#define BL_SERIAL Serial2

#define BAUD_RATE 9600
#define BUFFER_MAX 64
#define ID_MAX 32

#define F_WORLD_POS "/w"
#define F_NETWORK "/n"
#define F_USER "/u"
#define F_OWNER "/o"
#define F_DEV_ID "/d"
#define F_API_KEY "/a"

enum bl_resp_type {
  BL_WIFI_CRED = 'W',
  BL_USER_CRED = 'U',
  BL_LONLAT = 'L',
  BL_INVALID = 0
};

const int SD_SS = 5;

char buffer[BUFFER_MAX] = {0};

char field1[ID_MAX] = {0};
char field2[ID_MAX] = {0};

int buf_len = 0;

//========================BLUETOOTH HANDLING========================

bl_resp_type bl_get_type(void) {
  if(buffer[0] != 'W' && buffer[0] != 'U' && buffer[0] != 'L') {
    return BL_INVALID;
  }

  return (bl_resp_type)buffer[0];
}

bool bl_parse_data(void) {
  for(int i = 0; i < ID_MAX; i++) {
    field1[i] = 0;
    field2[i] = 0;
  }

  int i = 2;
  int cred_len = 0;

#define FILL_CRED(fillbuff) \
  for(; i < buffer[i] && buffer[i] != '$'; i++) { \
    fillbuff[cred_len++] = buffer[i]; \
  }

  FILL_CRED(field1);

  i++;
  cred_len = 0;

  FILL_CRED(field2);

#undef FILL_CRED

  return true;
}

bool bl_check_credentials(char expected_type) {
  return buffer[0] == expected_type;
}

bool bl_has_connected(void) {
  return !strncmp(buffer, "CONNECTED", 9);
}

bool bl_has_disconnected(void) {
  return !strncmp(buffer, "+DISC:SUCCESS", 13);
}

bool bl_get_response(void) {
  if(!BL_SERIAL.available()) {
    return false;
  }
  
  for(int i = 0; i < BUFFER_MAX - 1; i++) {
    buffer[i] = 0;
  }

  BL_SERIAL.readBytesUntil('\n', buffer, BUFFER_MAX - 1);

  return true;
}

//========================BLUETOOTH HANDLING========================

//========================SD HANDLING========================

int path_i = 0;

bool sd_initialize_file(const char *ptr) {
  if(SD.exists(ptr)) {
    return false;
  }

  Serial.print(F("Creating: "));
  Serial.println(ptr);

  File f = SD.open(ptr, FILE_WRITE);
  f.close();

  return true;
}

// bool sd_initialize_files(void) {
//   Serial.println("Initializing files...");

//   f = SD.open("/paths.txt");

//   while(f.available()) {
//     char ch = f.read();

//     if(ch != ';') {
//       field1[path_i++] = ch;
//     } else {
//       path_i = 0;

//       Serial.println(field1);
//       f2 = SD.open(field1, FILE_WRITE);
//       f2.close();

//       for(int i = 0; i < ID_MAX; i++) {
//         field1[i] = 0;
//       }
//     }
//   }

//   return false;
// }

//========================SD HANDLING========================

void setup() {
  Serial.begin(BAUD_RATE);
  BL_SERIAL.begin(BAUD_RATE);

  delay(500);
  while(!Serial) { ; }

  if(!SD.begin(SD_SS)) {
    Serial.println("SD: Initialization failed.");
    return;
  }

  Serial.println("SD: Connected successfully.");

  sd_initialize_file(F_WORLD_POS);
  sd_initialize_file(F_NETWORK);
  sd_initialize_file(F_USER);
  sd_initialize_file(F_OWNER);
  sd_initialize_file(F_DEV_ID);
  sd_initialize_file(F_API_KEY);
}

void loop() {
  if(bl_get_response()) {
    bl_resp_type rt = bl_get_type();

    Serial.println(buffer);

    if(rt) {
      if(bl_parse_data()) {
        int last_time = 0;

        switch(rt) {
        case BL_WIFI_CRED:
          Serial.println(F("WiFi credentials entered..."));
          WiFi.begin(field1, field2);

          last_time = millis();
          while(WiFi.status() != WL_CONNECTED) {
            if(millis() - last_time >= 2000) {
              Serial.println("Connection timed out...");
              BL_SERIAL.write("W0");

              break;
            }
          }

          if(WiFi.status() == WL_CONNECTED) {
            Serial.println(F("WiFi connection established..."));
            BL_SERIAL.write("W1");
          }

          break;
        case BL_USER_CRED:
          Serial.println(F("User credentials entered..."));
          BL_SERIAL.write("U1");

          break;
        }
      }
    }
  }
}
