import pymongo
import hashlib
import os
from bson import ObjectId
from dotenv import load_dotenv
import json
import random
import string

load_dotenv()
uri = os.environ["MONGODB_URI"]

client = pymongo.MongoClient(uri)
db = client["data"]
users = db["users"]
break_ins = db["break_ins"]
devices = db["devices"]


def generate_random_string():
    characters = string.ascii_letters + string.digits + string.punctuation
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
                return {"code": 400, "message": "Username or password is incorrect"}

    return {"code": 400, "message": "Username or password is incorrect"}


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
            return {"code": 400, "message": "Device already registered"}

    API_key = generate_random_string()

    devices.insert_one(
        {'id': id, 'owner_id': owner_id, 'lat': lat,
            'lon': lon, 'API_key': str(API_key)}
    )

    return {"code": 200, "message": "Device registered successfully", "API_key": str(API_key)}


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
        return {"code": 403, "message": "Permission denied"}

    if check_owner(owner_id) == 0:
        return {"code": 404, "message": "User not found"}

    if check_device(device_id) == 0:
        return {"code": 404, "message": "Device not found or already has an owner"}

    device_schema = {"id": device_id}
    owner_schema = {"_id": ObjectId(owner_id)}
    owner = users.find_one(owner_schema)

    new_array = owner["device_ids"]
    if new_array == None:
        new_array = []

    new_array.append(device_id)
    values = {"$set": {"owner_id": owner_id}}

    users.update_one(owner_schema, {"$set": {"device_ids": new_array}})
    devices.update_one(device_schema, values)

    return {"code": 200, "message": "Owner added successfully"}


def add_break_in(device_id, API_key):
    if check_device_api_key(API_key) == 0:
        return {"code": 403, "message": "Permission denied"}
    
    if get_device_by_ID(device_id)["API_key"] != API_key:
        return {"code": 403, "message": "Permission denied!"}

    for i in devices.find({}):
        if i["id"] == device_id:
            break_ins.insert_one(
                {"device_id": i["id"], "owner_id": i["owner_id"],
                    "lat": i["lat"], "lon": i["lon"]}
            )
            return {"code": 200, "message": "Break in added successfully"}

    return {"code": 404, "message": "Could not find device"}


def get_break_ins(device_id, user_API_key):
    if check_device(device_id, False) == 0:
        return {"code": 404, "message": "Device not found"}
    
    if check_user_api_key(user_API_key) == 0:
        return {"code": 404, "message": "User not found"}

    if ObjectId(get_device_by_ID(device_id)["owner_id"]) != get_user_by_API_key(user_API_key)["_id"]:
        return {"code": 403, "message": "Permission denied"}

    breaks = []
    index = 0

    for i in break_ins.find({}):
        breaks.append(
            {"device_id": i["device_id"],
             "lat": i["lat"], "lon": i["lon"]}
        )

        if i["device_id"] == device_id:
            breaks[0], breaks[index] = breaks[index], breaks[0]

        index += 1

    return {"code": 200, "break_ins": breaks}

def get_devices_for_user(API_key):
    if check_user_api_key(API_key) == 0:
        return {"code": 404, "message": "User not found"}
    
    user = get_user_by_API_key(API_key)

    return {"code": 200, "message": "Successfully GOT the owned devices for user", "device_ids": user["device_ids"] }