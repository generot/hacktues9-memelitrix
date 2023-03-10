#define BUFFER_MAX 64
#define CREDENTIALS_MAX 32

#define BAUD_RATE 9600

#define WIFI_RX 6
#define WIFI_TX 5

#define BL_SERIAL Serial
#define BL_ENABLE_PIN 22

char wss[] = "InnovationForumGuests";
char wpass[] = "";

int wifi_status = 0;

//===================BLUETOOTH INTERFACING===================

char bl_res_buffer[BUFFER_MAX] = {0};

char bl_ssid[CREDENTIALS_MAX] = {0};
char bl_pass[CREDENTIALS_MAX] = {0};

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

//===================BLUETOOTH INTERFACING===================

void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println("Hello, world");
  delay(1000);
}
