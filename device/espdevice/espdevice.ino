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

#define PIN_PIR1 25
#define PIN_LASER 26
#define PIN_VOLDIV 27

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

String api_token;
String client_last_response;

endpoint_type last_resp_type;

bool credentials_avail = true;
bool initialization_done = false;

char buffer[BUFFER_MAX] = {0};

char field1[ID_MAX] = {0};
char field2[ID_MAX] = {0};

int buf_len = 0;

String usr_id;
int dev_id = 0;

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

//========================SD HANDLING========================

//========================HTTP REQUEST HANDLING========================

bool post(const char* server_url, const char *route, const char *data, int datalen) {
  if(WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  Serial.println("Sending POST request...");
  int con_status = client.connect(server_url, SERVER_PORT);

  Serial.println(String(server_url) + String(route));
  
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

//========================BACKEND HANDLING=============================

bool send_to_endpoint(String& route, endpoint_type tp) {
  String resp = "{\"code\": 200, \"message\": \"OK\"}";

  Serial.println(route);

  if(!post("memelitrix.loca.lt", route.c_str(), resp.c_str(), resp.length())) {
    return false;
  }

  Serial.println("Reading response...");

  last_resp_type = (endpoint_type)tp;

  return true;
}

bool authorize_user(bool is_preparsed = false) {
  if(!is_preparsed) {
    bl_parse_data();
  }

  String body = "/_login?username=" + String(field1) + "&password=" + String(field2);

  return send_to_endpoint(body, EP_USER_AUTH);
}

bool add_device() {
  dev_id = micros();

  String url = "/addDevice?id=" + String(dev_id) + "&lon=" + String(field2) + "&lat=" + String(field1);
  
  return send_to_endpoint(url, EP_ADD_DEVICE);  
}

bool add_owner() {
  String url = "/addOwner?device_id=" + String(dev_id) + "&owner_id=" + usr_id;

  return send_to_endpoint(url, EP_ADD_OWNER);
}

bool add_breakin() {
  String url = "/addBreakIn?id=" + String(dev_id) + "&API_key=" + api_token;

  return send_to_endpoint(url, EP_ADD_BREAKIN);
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

//========================BACKEND HANDLING=============================

void setup() {
  Serial.begin(BAUD_RATE);
  BL_SERIAL.begin(BAUD_RATE);

  delay(500);
  while(!Serial) { ; }

  pinMode(PIN_PIR1, INPUT);

  if(!SD.begin(SD_SS)) {
    Serial.println("SD: Initialization failed.");
    while(true) { ; }
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

  if(sd_parse_file(F_API_DEV_ID)) {
    bl_parse_data();
    Serial.println(field1);
    Serial.println(field2);

    api_token = String(field1);
    dev_id = atoi(field2);

    initialization_done = true;
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
          
          add_device();

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

  if(digitalRead(PIN_PIR1) && initialization_done) {
    Serial.println("Movement detected...");
    add_breakin();

    delay(10000);
  }

  if(read_client_response()) {
    String temp_file_content;

    switch(last_resp_type) {
    case EP_USER_AUTH:
      Serial.println("Code: " + client_last_response);
      last_resp_type = EP_INVALID;

      if(client_last_response != "null") {
        sd_write_file(F_USER, buffer, BUFFER_MAX);
        
        usr_id = String(client_last_response);

        BL_SERIAL.write("U1");
      } else {
        BL_SERIAL.write("U0");
      }
      break;
    case EP_ADD_DEVICE:
      if(client_last_response != "null") {
        api_token = String(client_last_response);
        temp_file_content = "D$" + api_token + "$" + String(dev_id);

        Serial.println("Token: " + api_token);

        sd_write_file(F_API_DEV_ID, (char*)temp_file_content.c_str(), temp_file_content.length());

        add_owner();
      }
      break;
    case EP_ADD_OWNER:
      initialization_done = true;
      break;
    case EP_ADD_BREAKIN:
      if(client_last_response == "200") {
        Serial.println("Break-in successfully added!");
      }

      break;
    }

    client_last_response = "";
  }
}