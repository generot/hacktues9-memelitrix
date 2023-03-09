from flask import Blueprint, render_template, request
<<<<<<< HEAD
from flask_cors import cross_origin
=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
import db
import json

views = Blueprint("views", "views")

<<<<<<< HEAD

@views.route("/")
def home():
    return render_template("start.html")

=======
@views.route("/")
def home():
    return render_template("index.html")
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8

@views.route("/map")
def map_page():
    return render_template("map.html")

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/about_us")
def about_us_page():
    return render_template("about_us.html")

# @views.route("/login")
# def login_page():
#     return render_template("login.html")

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/register")
def register_page():
    return render_template("register.html")

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/leaderboard")
def leaderboard_page():
    return render_template("leaderboard.html")

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/user/profile")
def profile():
    return render_template("profile.html")

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/register", methods=["POST"])
def register():
    data = request.args.to_dict()

    username = data['username']
    password = data['password']

    return db.add_user(username, password)

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/login", methods=["GET"])
def login():
    data = request.args.to_dict()
    username = data["username"]
    password = data["password"]

    a = db.check_user(username, password)
    return a

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/verify", methods=["GET"])
def verify_user():
    data = request.args.to_dict()
    username = data["username"]

    return db.verify_user_db(username)

<<<<<<< HEAD

=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
@views.route("/fetchAll", methods=["GET"])
def fetch_all_users():
    return db.fetch_users()

<<<<<<< HEAD

@views.route("/addDevice", methods=["POST"])
def add_device():
    data = request.args.to_dict()

    id = data["id"]
    owner_id = None
    lon = data["lon"]
    lat = data["lat"]

    return db.add_device(id, owner_id, lat, lon)


@views.route("/addOwner", methods=["POST"])
=======
@views.route("/addDevice", methods=["GET"])
def add_device():
    data = request.args.to_dict()

    id       = data["id"]
    owner_id = None
    lon      = data["lon"]
    lat      = data["lat"]


    return db.add_device(id, owner_id, lat, lon)

@views.route("/addOwner", methods=["GET"])
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
def add_owner():
    data = request.args.to_dict()

    device_id = data["device_id"]
<<<<<<< HEAD
    owner_id = data["owner_id"]

    return db.add_owner(device_id, owner_id)


@views.route("/addBreakIn", methods=["POST"])
def add_break_in():
    data = request.args.to_dict()

    device_id = data["id"]

    return db.add_break_in(device_id)


@views.route("/getBreakIns", methods=["GET"])
@cross_origin()
def get_break_in():
    data = request.args.to_dict()
    device_id = data["id"]

    return json.dumps(db.get_break_ins(device_id))
=======
    owner_id  = data["owner_id"]

    print("AAAAAA")
    print(type(owner_id))

    return db.add_owner(device_id, owner_id)
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
