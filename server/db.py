import pymongo
import hashlib
import os
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()
uri = os.environ["MONGODB_URI"]

client = pymongo.MongoClient(uri)
db = client["data"]
users = db["users"]
points = db["points"]
devices = db["devices"]

def add_user(username, password):
    #check if user exists
    for i in users.find({}):
        if i["name"] == username:
            return {"code": 400, "message": "User already exists"}

    #password hashing
    password = password.encode()
    salt = 32*b'\x00'
    password_hash = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)

    #insert user
    _id = users.insert_one({'name': username, 'password': password_hash, 'device_ids': None})

    return {"code": 200, "message": "User registered successfully", "id": str(_id.inserted_id)}

def check_user(username, password):
    for i in users.find({}):
        if i["name"] == username:
            password = password.encode()
            salt = 32*b'\x00'
            password_hash = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)

            if i["password"] == password_hash:
                return {"code": 200, "message": "User logged in successfully", "username": i["name"], "id": str(i["_id"])}
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

    devices.insert_one({'id': id, 'owner_id': owner_id, 'lat': lat, 'lon': lon})

    return {"code": 200, "message": "Device registered successfully"}

def check_owner(owner_id):
    for i in users.find({}):
        if str(i["_id"]) == owner_id:
            return 1
    
    return 0

def check_device(device_id):
    for i in devices.find({}):
        if i["id"] == device_id and i["owner_id"] == None:
            return 1
    
    return 0

def add_owner(device_id, owner_id):
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
    values = { "$set": { "owner_id": owner_id } }

    users.update_one(owner_schema, { "$set": { "device_ids": new_array } } )    
    devices.update_one(device_schema, values)

    return {"code": 200, "message": "Owner added successfully"}

