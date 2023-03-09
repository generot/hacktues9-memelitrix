from flask import Blueprint, render_template, request
import db
import json

views = Blueprint("views", "views")

@views.route("/")
def home():
    return render_template("index.html")

@views.route("/map")
def map_page():
    return render_template("map.html")

@views.route("/about_us")
def about_us_page():
    return render_template("about_us.html")

# @views.route("/login")
# def login_page():
#     return render_template("login.html")

@views.route("/register")
def register_page():
    return render_template("register.html")

@views.route("/leaderboard")
def leaderboard_page():
    return render_template("leaderboard.html")

@views.route("/user/profile")
def profile():
    return render_template("profile.html")

@views.route("/register", methods=["POST"])
def register():
    data = request.args.to_dict()

    username = data['username']
    password = data['password']

    return db.add_user(username, password)

@views.route("/login", methods=["GET"])
def login():
    data = request.args.to_dict()
    username = data["username"]
    password = data["password"]

    a = db.check_user(username, password)
    return a

@views.route("/verify", methods=["GET"])
def verify_user():
    data = request.args.to_dict()
    username = data["username"]

    return db.verify_user_db(username)

@views.route("/fetchAll", methods=["GET"])
def fetch_all_users():
    return db.fetch_users()

@views.route("/addDevice", methods=["GET"])
def add_device():
    data = request.args.to_dict()

    id       = data["id"]
    owner_id = None
    lon      = data["lon"]
    lat      = data["lat"]


    return db.add_device(id, owner_id, lat, lon)

@views.route("/addOwner", methods=["GET"])
def add_owner():
    data = request.args.to_dict()

    device_id = data["device_id"]
    owner_id  = data["owner_id"]

    print("AAAAAA")
    print(type(owner_id))

    return db.add_owner(device_id, owner_id)
