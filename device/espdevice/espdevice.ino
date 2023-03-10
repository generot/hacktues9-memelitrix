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
#define F_API_DEV_ID "/d"

#define SERVER_PORT 80

enum bl_resp_type {
  BL_WIFI_CRED = 'W',
  BL_USER_CRED = 'U',
  BL_LONLAT = 'L',
  BL_INVALID = 0
};

enum endpoint_type {
  EP_USER_AUTH,
  EP_ADD_BREAKIN,
  EP_ADD_OWNER,
  EP_ADD_DEVICE,
  EP_INVALID
};

const int SD_SS = 5;

WiFiClient client;

String client_last_response;
endpoint_type last_resp_type;

bool credentials_avail = true;

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

bool sd_write_file(const char *path, char *buff, int size) {
  if(!SD.exists(path)) {
    return false;
  }

  File f = SD.open(path, FILE_WRITE);

  f.write((uint8_t*)buff, size);

  return true;
}

bool sd_parse_file(const char *path, bool check_existence = false) {
  if(!SD.exists(path)) {
    return false;
  }

  if(check_existence) {
    return true;
  }

  File f = SD.open(path);

  if(!f.available()) {
    f.close();
    return false;
  }

  f.read((uint8_t*)buffer, BUFFER_MAX);
  f.close();

  return true;
}

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

//========================HTTP REQUEST HANDLING========================

bool post(const char* server_url, const char *route, const char *data, int datalen) {
  if(WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  Serial.println("Sending POST request...");
  int con_status = client.connect(server_url, SERVER_PORT);
  
  if(con_status) {
    //POST request form
    client.print(F("POST "));
    client.print(route);
    client.print(F(" HTTP/1.0\r\n"));

    client.print(F("Host: ")); 
    client.print(server_url);
    client.print(F("\r\n"));

    client.print(F("Connection: close\r\n"));
    client.print("Content-Length: ");
    client.print(String(datalen));
    client.print(F("\r\n"));
    client.print(F("\r\n"));
    client.print(data);
    client.print(F("\r\n\r\n"));
  } else {
    Serial.println(F("Connection could not be established..."));
    return false;
  }

  return true;
}

//========================HTTP REQUEST HANDLING========================

bool authorize_user(bool is_preparsed = false) {
  if(!is_preparsed) {
    bl_parse_data();
  }

  String body = "/_login?username=" + String(field1) + "&password=" + String(field2);
  String resp = "{\"code\": 200, \"message\": \"OK\"}";

  Serial.println(body);

  if(!post("a041-85-187-10-224.ngrok.io", body.c_str(), resp.c_str(), resp.length())) {
    return false;
  }

  Serial.println("Reading response...");

  last_resp_type = EP_USER_AUTH;

  return true;
}

bool read_client_response(void) {
  if(client.available()) {
    //Serial.println(client_last_response);
    client_last_response = client.readStringUntil('\n');
  } else if(client_last_response.length()) {
    return true;
  }

  return false;  
}

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

  if(!sd_parse_file(F_NETWORK)) {
    Serial.println("Credentials UNAVAILABLE.");
    credentials_avail = false;
  } else {
    Serial.println("Credentials available!");
    bl_parse_data();

    Serial.println(field1);
    Serial.println(field2);

    WiFi.begin(field1, field2);

    int last_time = millis();
    while(WiFi.status() != WL_CONNECTED) {
      if(millis() - last_time >= 2000) {
        Serial.println(F("Connection timed out..."));
        return;
      }
    }    
  }

  if(sd_parse_file(F_USER)) {
    authorize_user();
  }

  sd_initialize_file(F_WORLD_POS);
  sd_initialize_file(F_NETWORK);
  sd_initialize_file(F_USER);
  sd_initialize_file(F_API_DEV_ID);
}

void bluetooth_int() {
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

              return;
            }
          }

          if(WiFi.status() == WL_CONNECTED) {
            Serial.println(F("WiFi connection established..."));
            BL_SERIAL.write("W1");
          }

          sd_write_file(F_NETWORK, buffer, BUFFER_MAX);

          break;
        case BL_USER_CRED:
          Serial.println(F("User credentials entered..."));

          authorize_user(true);

          break;
        case BL_LONLAT:
          Serial.println(F("Lonlat received!"));
          
          sd_write_file(F_WORLD_POS, buffer, BUFFER_MAX);
          credentials_avail = true;

          break;
        }
      }
    }
  }
}

void loop() {
  if(!credentials_avail) {
    bluetooth_int();
  }

  if(read_client_response()) {
    switch(last_resp_type) {
    case EP_USER_AUTH:
      Serial.println("Code: " + client_last_response);
      last_resp_type = EP_INVALID;

      if(client_last_response != "null") {
        sd_write_file(F_USER, buffer, BUFFER_MAX);
        sd_write_file(F_API_DEV_ID, (char*)client_last_response.c_str(), client_last_response.length());

        BL_SERIAL.write("U1");
      } else {
        BL_SERIAL.write("U0");
      }
      break;
    }
  }
}