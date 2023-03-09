import requests
from pymongo import *

client = MongoClient("mongodb+srv://Sasho:Rikoshet123321@ability.hsrp9.mongodb.net/Ability?retryWrites=true&w=majority")
db = client["data"]
ads = db["users"]

def check_req():
    URL = "http://127.0.0.1:5000/tasks/get"
    PARAMS = {"title": "test", "description": "test", "uid": "1", "location": "test"}

    r = requests.get(url = URL, params = PARAMS)

    data = r.json()

    print(data)

def cascade_insert():
    ads.update_many({}, {"$set": {"points": 0}})
