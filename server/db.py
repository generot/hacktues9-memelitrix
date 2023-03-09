import pymongo
import hashlib
import os
from bson import ObjectId
from dotenv import load_dotenv
<<<<<<< HEAD
import json
=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8

load_dotenv()
uri = os.environ["MONGODB_URI"]

client = pymongo.MongoClient(uri)
db = client["data"]
users = db["users"]
<<<<<<< HEAD
break_ins = db["break_ins"]
devices = db["devices"]


def add_user(username, password):
    # check if user exists
=======
points = db["points"]
devices = db["devices"]

def add_user(username, password):
    #check if user exists
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
    for i in users.find({}):
        if i["name"] == username:
            return {"code": 400, "message": "User already exists"}

<<<<<<< HEAD
    # password hashing
=======
    #password hashing
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
    password = password.encode()
    salt = 32*b'\x00'
    password_hash = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)

<<<<<<< HEAD
    # insert user
    _id = users.insert_one(
        {'name': username, 'password': password_hash, 'device_ids': None})

    return {"code": 200, "message": "User registered successfully", "id": str(_id.inserted_id)}


=======
    #insert user
    _id = users.insert_one({'name': username, 'password': password_hash, 'device_ids': None})

    return {"code": 200, "message": "User registered successfully", "id": str(_id.inserted_id)}

>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
def check_user(username, password):
    for i in users.find({}):
        if i["name"] == username:
            password = password.encode()
            salt = 32*b'\x00'
<<<<<<< HEAD
            password_hash = hashlib.pbkdf2_hmac(
                'sha256', password, salt, 100000)
=======
            password_hash = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8

            if i["password"] == password_hash:
                return {"code": 200, "message": "User logged in successfully", "username": i["name"], "id": str(i["_id"])}
            else:
                return {"code": 400, "message": "Username or password is incorrect"}
<<<<<<< HEAD

    return {"code": 400, "message": "Username or password is incorrect"}


=======
    
    return {"code": 400, "message": "Username or password is incorrect"}

>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
def fetch_users():
    cursor = users.find({})
    all_users = []

    for i in cursor:
        i["_id"] = None
        i["password"] = None
        all_users.append(i)
<<<<<<< HEAD

    return {"code": 200, "message": "STATUS OK", "users": all_users}


=======
        
    return {"code": 200, "message": "STATUS OK", "users": all_users}

>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
def verify_user_db(username):
    schema = {"name": username}
    user = users.find_one(schema)

    if user:
        return {"code": 200, "message": "STATUS OK", "exists": True}

    return {"code": 200, "message": "STATUS OK", "exists": False}

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
def add_device(id, owner_id, lat, lon):
    for i in devices.find({}):
        if i["id"] == id:
            return {"code": 400, "message": "Device already registered"}

<<<<<<< HEAD
    devices.insert_one(
        {'id': id, 'owner_id': owner_id, 'lat': lat, 'lon': lon})

    return {"code": 200, "message": "Device registered successfully"}


=======
    devices.insert_one({'id': id, 'owner_id': owner_id, 'lat': lat, 'lon': lon})

    return {"code": 200, "message": "Device registered successfully"}

>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
def check_owner(owner_id):
    for i in users.find({}):
        if str(i["_id"]) == owner_id:
            return 1
<<<<<<< HEAD

    return 0


def check_device(device_id, check_owner=True):
    for i in devices.find({}):
        if i["id"] == device_id:
            if check_owner == False:
                return 1

            if i["owner_id"] == None:
                return 1

    return 0


def add_owner(device_id, owner_id):
    if check_owner(owner_id) == 0:
        return {"code": 404, "message": "User not found"}

=======
    
    return 0

def check_device(device_id):
    for i in devices.find({}):
        if i["id"] == device_id and i["owner_id"] == None:
            return 1
    
    return 0

def add_owner(device_id, owner_id):
    if check_owner(owner_id) == 0:
        return {"code": 404, "message": "User not found"}
    
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
    if check_device(device_id) == 0:
        return {"code": 404, "message": "Device not found or already has an owner"}

    device_schema = {"id": device_id}
    owner_schema = {"_id": ObjectId(owner_id)}
    owner = users.find_one(owner_schema)

    new_array = owner["device_ids"]
    if new_array == None:
        new_array = []

    new_array.append(device_id)
<<<<<<< HEAD
    values = {"$set": {"owner_id": owner_id}}

    users.update_one(owner_schema, {"$set": {"device_ids": new_array}})
=======
    values = { "$set": { "owner_id": owner_id } }

    users.update_one(owner_schema, { "$set": { "device_ids": new_array } } )    
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
    devices.update_one(device_schema, values)

    return {"code": 200, "message": "Owner added successfully"}

<<<<<<< HEAD

def add_break_in(device_id):
    if check_device(device_id, False) == 0:
        return {"code": 404, "message": "Device not found"}

    for i in devices.find({}):
        if i["id"] == device_id:
            break_ins.insert_one(
                {"device_id": i["id"], "owner_id": i["owner_id"],
                    "lat": i["lat"], "lon": i["lon"]}
            )
            return {"code": 200, "message": "Break in added successfully"}

    return {"code": 404, "message": "Could not find device"}


def get_break_ins(device_id):
    if check_device(device_id, False) == 0:
        return {"code": 404, "message": "Device not found"}

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
=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
