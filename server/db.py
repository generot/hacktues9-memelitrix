import pymongo
import hashlib
import os
from bson import ObjectId
from dotenv import load_dotenv
import json
import random
import string
from math import *
from pywebpush import webpush, WebPushException
import datetime

load_dotenv()
uri = os.environ["MONGODB_URI"]
PUBLIC = os.environ["VAPID_PUBLIC"]
PRIVATE = os.environ["VAPID_PRIVATE"]
SUBJECT = os.environ["VAPID_SUBJECT"]

client = pymongo.MongoClient(uri)
db = client["data"]
users = db["users"]
break_ins = db["break_ins"]
devices = db["devices"]


def generate_random_string():
    characters = string.ascii_letters + string.digits + string.punctuation
    characters = characters.replace("$", "")
    print(characters)
    return ''.join(random.choice(characters) for i in range(20))


def add_user(username, password):
    # check if user exists
    for i in users.find({}):
        if i["name"] == username:
            return {"code": 400, "message": "User already exists"}

    # password hashing
    password = password.encode()
    salt = 32*b'\x00'
    password_hash = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)
    API_key = generate_random_string()

    # insert user
    _id = users.insert_one(
        {'name': username, 'password': password_hash,
            'device_ids': None, 'API_key': API_key}
    )

    return {"code": 200, "message": "User registered successfully", "id": str(_id.inserted_id), "API_key": API_key}


def check_user(username, password):
    for i in users.find({}):
        if i["name"] == username:
            password = password.encode()
            salt = 32*b'\x00'
            password_hash = hashlib.pbkdf2_hmac(
                'sha256', password, salt, 100000)

            if i["password"] == password_hash:
                return {"code": 200, "message": "User logged in successfully", "username": i["name"], "id": str(i["_id"]), "API_key": str(i["API_key"])}
            else:
                return {"code": 400, "message": "Username or password is incorrect", "API_key": "null"}

    return {"code": 400, "message": "Username or password is incorrect", "API_key": "null"}


def _check_user(username, password):
    for i in users.find({}):
        if i["name"] == username:
            password = password.encode()
            salt = 32*b'\x00'
            password_hash = hashlib.pbkdf2_hmac(
                'sha256', password, salt, 100000)

            if i["password"] == password_hash:
                return str(i["_id"])
            else:
                return "null"

    return "null"

def fetch_users():
    cursor = users.find({})
    all_users = []

    for i in cursor:
        i["_id"] = None
        i["password"] = None
        all_users.append(i)

    return {"code": 200, "message": "STATUS OK", "users": all_users}


def verify_user_db(username):
    schema = {"name": username}
    user = users.find_one(schema)

    if user:
        return {"code": 200, "message": "STATUS OK", "exists": True}

    return {"code": 200, "message": "STATUS OK", "exists": False}


def add_device(id, owner_id, lat, lon):
    for i in devices.find({}):
        if i["id"] == id:
            return "null"

    API_key = generate_random_string()

    devices.insert_one(
        {'id': id, 'owner_id': owner_id, 'lat': lat,
            'lon': lon, 'API_key': str(API_key)}
    )

    return str(API_key)


def dist(lat1, lon1, lat2, lon2):
    lat1 = float(lat1)
    lon1 = float(lon1)
    lat2 = float(lat2)
    lon2 = float(lon2)
    return acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lon2-lon1))*6371


def check_owner(owner_id):
    for i in users.find({}):
        if str(i["_id"]) == owner_id:
            return 1

    return 0


def check_device(device_id, check_owner=True):
    for i in devices.find({}):
        if i["id"] == device_id:
            if check_owner == False:
                return 1

            if i["owner_id"] == None:
                return 1

    return 0


def get_user_API_key_by_ID(id):
    for i in users.find({}):
        if i["_id"] == ObjectId(id):
            return i["API_key"]

    return None


def get_device_API_key_by_ID(id):
    for i in devices.find({}):
        if i["id"] == id:
            return i["API_key"]

    return None


def check_device_api_key(API_key):
    for i in devices.find({}):
        if i["API_key"] == API_key:
            return 1

    return 0


def check_user_api_key(API_key):
    for i in users.find({}):
        if i["API_key"] == API_key:
            return 1

    return 0


def get_user_by_API_key(API_key):
    for i in users.find({}):
        if i["API_key"] == API_key:
            return i

    return None


def get_device_by_ID(id):
    for i in devices.find({}):
        if i["id"] == id:
            return i

    return None


def add_owner(device_id, owner_id):
    if check_device_api_key(get_device_API_key_by_ID(device_id)) == 0:
        return "null"

    if check_owner(owner_id) == 0:
        return "null"

    if check_device(device_id) == 0:
        return "null"

    device_schema = {"id": device_id}
    owner_schema = {"_id": ObjectId(owner_id)}
    owner = users.find_one(owner_schema)

    new_array = owner["device_ids"]
    if new_array == None:
        new_array = []

    new_array.append(device_id)
    new_array.sort()
    values = {"$set": {"owner_id": owner_id}}

    users.update_one(owner_schema, {"$set": {"device_ids": new_array}})
    devices.update_one(device_schema, values)

    return "200"


def add_break_in(device_id, API_key):
    if check_device(device_id, False) == 0:
        return "null"
    
    if check_device_api_key(API_key) == 0:
        return "null"

    device = get_device_by_ID(device_id)
    if device["API_key"] != API_key:
        return "null"


    date = datetime.datetime.now()
    break_ins.insert_one({"device_id": device["id"], "owner_id": device["owner_id"],"lat": device["lat"], "lon": device["lon"], "date": date.isoformat()})

    device_schema = {"id": device_id}
    values = {"$set": {"last_break_in": date}}

    devices.update_one(device_schema, values)
    
    for i in devices.find({}):
        if dist(i["lat"], i["lon"], device["lat"], device["lon"]) < 0.1:
            owner_shema = {"_id": ObjectId(i["owner_id"])}
            owner = users.find_one(owner_shema)

            if "sub" in owner:
                push_notification(owner["sub"])

    return "200"


def get_break_ins(device_id, user_API_key):
    if check_device(device_id, False) == 0:
        return {"code": 404, "message": "Device not found"}

    if check_user_api_key(user_API_key) == 0:
        return {"code": 404, "message": "User not found"}

    if ObjectId(get_device_by_ID(device_id)["owner_id"]) != get_user_by_API_key(user_API_key)["_id"]:
        return {"code": 403, "message": "Permission denied"}

    breaks = []

    device = get_device_by_ID(device_id)
    breaks.append(
        {"device_id": device_id, "lat": device["lat"], "lon": device["lon"], "date": None}
    )

    for i in break_ins.find({}):
        if i["device_id"] != device_id:
            breaks.append(
                {"device_id": i["device_id"], "lat": i["lat"], "lon": i["lon"], "date": i["date"]}
            )

    return {"code": 200, "break_ins": breaks}


def check_point(lat, lon, top, bottom, left, right):
    if lat >= bottom and lat <= top and lon >= left and lon <= right:
        return 1

    return 0


def get_break_ins_filter(user_API_key, top, bottom, left, right):
    if check_user_api_key(user_API_key) == 0:
        return {"code": 404, "message": "User not found"}

    breaks = []

    for i in break_ins.find({}):
        if check_point(float(i["lat"]), float(i["lon"]), top, bottom, left, right) == 1:
            breaks.append(
                {"device_id": i["device_id"],
                 "lat": i["lat"], "lon": i["lon"]}
            )

    return {"code": 200, "break_ins": breaks}


def get_devices_for_user(API_key):
    if check_user_api_key(API_key) == 0:
        return {"code": 404, "message": "User not found"}

    user = get_user_by_API_key(API_key)
    
    dates = []

    for i in user["device_ids"]:
        device_schema = {"id" : i}

        device = devices.find_one(device_schema)
        if device != None:
            if "last_break_in" in device:
                dates.append(device["last_break_in"])
            else:
                dates.append(None)

    return {"code": 200, "message": "Successfully GOT the owned devices for user", "device_ids": user["device_ids"], "date": dates}


def get_public_key():
    return {"public": PUBLIC}


def add_sub_key(API_key, sub):
    user_schema = {"API_key": API_key}
    values = {"$set": {"sub": sub}}

    users.update_one(user_schema, values)

    return {"code": 200, "message": "Added sub key"}


def push_notification(sub):
    result = "OK"
    try:
        webpush(
            subscription_info=sub,
            data=json.dumps({
                "title": "Intrusion occured",
                "body": "Break in occured in a device near you",
                "icon": "static/images/logo.png"
            }),
            vapid_private_key=PRIVATE,
            vapid_claims={"sub": SUBJECT}
        )
    except WebPushException as ex:
        print(ex)
        result = "FAILED"
    return result
